import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
}

interface User {
  id: string;
  username: string;
  avatar_url: string;
}

const ChatCard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser();
    fetchMessagesAndProfiles();
    const subscription = subscribeToMessages();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUser({
            id: user.id,
            username: data.username,
            avatar_url: data.avatar_url,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMessagesAndProfiles = async () => {
    try {
      // Fetch messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData) {
        // Fetch profiles separately
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url');

        if (profilesError) throw profilesError;

        // Map profiles by user_id
        const profilesMap = profilesData.reduce((map: any, profile: any) => {
          map[profile.user_id] = profile;
          return map;
        }, {});

        // Attach profile data to each message
        const messagesWithProfiles = messagesData.map((message: Message) => ({
          ...message,
          profiles: profilesMap[message.user_id] || null,
        }));

        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages and profiles:', error);
    }
  };

  const subscribeToMessages = () => {
    try {
      return supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const newMessage = payload.new as Message;
          console.log('New message received:', newMessage); // Log new message to debug

          // Fetch the profile for the new message user
          supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', newMessage.user_id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                newMessage.profiles = data;
              }
              setMessages(prevMessages => [...prevMessages, newMessage]);
            });
        })
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
  
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(), // Set the current timestamp for created_at
        });
  
      if (error) throw error;
  
      setNewMessage(''); // Clear input after sending message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Real-time Chats
      </h4>

      <div className="flex flex-col h-[calc(100vh-200px)] px-7.5">
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user?.id ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`flex ${
                  message.user_id === user?.id ? 'flex-row-reverse' : 'flex-row'
                } items-end`}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
                  <Image
                    width={32}
                    height={32}
                    src={message.profiles?.avatar_url || '/images/user/user-01.png'}
                    alt={message.profiles?.username || 'User'}
                  />
                </div>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.user_id === user?.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.profiles?.username && (
                    <p className="text-xs mt-1 opacity-70">{message.profiles.username}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mr-2 p-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatCard;
