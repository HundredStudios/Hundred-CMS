'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ContactsTable = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, reason, message, read, date')
        .order('date', { ascending: false });

      if (error) throw error;
      console.log('Fetched contacts:', data); // Add this line for debugging
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadChange = async (id, currentReadStatus) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ read: !currentReadStatus })
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, read: !currentReadStatus } : contact
      ));
    } catch (error) {
      console.error('Error updating contact read status:', error);
    }
  };

  const toggleMessageExpansion = (id) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMessage = (message, id) => {
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
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Name
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Reason
              </th>
              <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                Message
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Date
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Read
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <h5 className="font-medium text-black dark:text-white">
                    {contact.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {contact.email}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {contact.reason}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {renderMessage(contact.message, contact.id)}
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(contact.date).toLocaleString()}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={contact.read}
                      onChange={() => handleReadChange(contact.id, contact.read)}
                      className="form-radio h-5 w-5 text-blue-600"
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