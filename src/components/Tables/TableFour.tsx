'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Contact {
  id: number;
  name: string;
  email: string;
  reason: string;
  message: string;
  read: boolean;
  date: string; // Use Date type if needed
}

const ContactsTable = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from<Contact>('contacts') // specify type here
        .select('id, name, email, reason, message, read, date')
        .order('date', { ascending: false });

      if (error) throw error;
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadChange = async (id: number, currentReadStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ read: !currentReadStatus })
        .eq('id', id);

      if (error) throw error;

      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === id ? { ...contact, read: !currentReadStatus } : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact read status:', error);
    }
  };

  const toggleMessageExpansion = (id: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMessage = (message: string, id: number) => {
    if (!message) return <p className="text-black dark:text-white">No message</p>;

    if (message.length <= 100 || expandedMessages[id]) {
      return (
        <>
          <p className="text-black dark:text-white">{message}</p>
          {message.length > 100 && (
            <button 
              onClick={() => toggleMessageExpansion(id)}
              className="text-blue-500 hover:text-blue-700 mt-2"
            >
              Show Less
            </button>
          )}
        </>
      );
    }
    return (
      <>
        <p className="text-black dark:text-white">
          {message.substring(0, 100)}...
        </p>
        <button 
          onClick={() => toggleMessageExpansion(id)}
          className="text-blue-500 hover:text-blue-700 mt-2"
        >
          Show More
        </button>
      </>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading contacts...</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-2 text-left dark:bg-meta-4">
            <tr>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Contact Details
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white hidden sm:table-cell">
                Message
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white hidden lg:table-cell">
                Date
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Read
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-[#eee] dark:border-strokedark">
                <td className="py-5 px-4">
                  <div className="flex flex-col">
                    <h5 className="font-medium text-black dark:text-white">
                      {contact.name}
                    </h5>
                    <p className="text-sm text-black dark:text-white">
                      {contact.email}
                    </p>
                    <p className="text-sm text-black dark:text-white mt-1">
                      Reason: {contact.reason}
                    </p>
                    <div className="sm:hidden mt-2">
                      {renderMessage(contact.message, contact.id)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 lg:hidden">
                      {new Date(contact.date).toLocaleString()}
                    </p>
                  </div>
                </td>
                <td className="py-5 px-4 hidden sm:table-cell">
                  {renderMessage(contact.message, contact.id)}
                </td>
                <td className="py-5 px-4 hidden lg:table-cell">
                  <p className="text-black dark:text-white">
                    {new Date(contact.date).toLocaleString()}
                  </p>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={contact.read}
                      onChange={() => handleReadChange(contact.id, contact.read)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
