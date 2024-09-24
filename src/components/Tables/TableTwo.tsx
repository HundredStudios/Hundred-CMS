'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const TableTwo = () => {
  const [linksData, setLinksData] = useState([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from('links')
        .select('id, type, link, description');
      if (error) {
        console.error('Error fetching links:', error);
      } else {
        setLinksData(data);
      }
    };
    
    fetchLinks();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 min-h-screen">
      

      {/* Links Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Link</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Description</th>
            </tr>
          </thead>
          <tbody>
            {linksData.map((link) => (
              <tr key={link.id} className="border-b border-stroke dark:border-strokedark">
                <td className="px-4 py-2 text-sm text-black dark:text-white">
                  {link.type}
                </td>
                <td className="px-4 py-2 text-sm text-blue-500 dark:text-blue-400">
                  <a href={link.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {link.link}
                  </a>
                </td>
                <td className="px-4 py-2 text-sm text-black dark:text-white">
                  {link.description || 'No description available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableTwo;
