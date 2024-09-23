import React, { useState, useEffect, useRef } from 'react';
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

interface GroupedMessage {
  date: string;
  messages: Message[];
}

const ChatCard: React.FC = () => {
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUser();
    fetchMessagesAndProfiles();
    const subscription = subscribeToMessages();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [groupedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url');

        if (profilesError) throw profilesError;

        const profilesMap = profilesData.reduce((map: any, profile: any) => {
          map[profile.user_id] = profile;
          return map;
        }, {});

        const messagesWithProfiles = messagesData.map((message: Message) => ({
          ...message,
          profiles: profilesMap[message.user_id] || null,
        }));

        groupMessagesByDate(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages and profiles:', error);
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped = messages.reduce((groups: GroupedMessage[], message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      const group = groups.find(g => g.date === date);
      if (group) {
        group.messages.push(message);
      } else {
        groups.push({ date, messages: [message] });
      }
      return groups;
    }, []);
    setGroupedMessages(grouped);
  };

  const subscribeToMessages = () => {
    try {
      return supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const newMessage = payload.new as Message;
          supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', newMessage.user_id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                newMessage.profiles = data;
              }
              addMessageToGroup(newMessage);
            });
        })
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  const addMessageToGroup = (newMessage: Message) => {
    setGroupedMessages(prevGroups => {
      const date = new Date(newMessage.created_at).toLocaleDateString();
      const lastGroup = prevGroups[prevGroups.length - 1];
      
      if (lastGroup && lastGroup.date === date) {
        return [
          ...prevGroups.slice(0, -1),
          { ...lastGroup, messages: [...lastGroup.messages, newMessage] }
        ];
      } else {
        return [...prevGroups, { date, messages: [newMessage] }];
      }
    });
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
          created_at: new Date().toISOString(),
        });
  
      if (error) throw error;
  
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-4 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Real-time Chats
      </h4>

      <div className="flex flex-col h-[400px] px-7.5">
        <div className="flex-grow overflow-y-auto mb-4 pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          {groupedMessages.map((group, groupIndex) => (
            <React.Fragment key={group.date}>
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <div className="mx-4 px-4 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {group.date}
                </div>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              {group.messages.map((message, messageIndex) => (
                <div key={message.id} className="mb-2">
                  <div className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${message.user_id === user?.id ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
                      <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          width={32}
                          height={32}
                          src={message.profiles?.avatar_url || '/images/user/user-01.png'}
                          alt={message.profiles?.username || 'User'}
                        />
                      </div>
                      <div className={`flex flex-col ${message.user_id === user?.id ? 'items-end mr-2' : 'items-start ml-2'}`}>
                        <span className="text-xs text-gray-500 mb-1">
                          {message.profiles?.username || 'Unknown User'}
                        </span>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.user_id === user?.id
                              ? 'bg-primary text-white'
                              : 'bg-black text-white'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
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