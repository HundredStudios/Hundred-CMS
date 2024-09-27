'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define an interface for the link data
interface Link {
  id: number; // Adjust type if 'id' is not a number
  type: string;
  link: string;
  description: string | null; // Can be null if no description
}

const TableTwo = () => {
  // Specify the type of the state
  const [linksData, setLinksData] = useState<Link[]>([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from('links')
        .select('id, type, link, description');

      if (error) {
        console.error('Error fetching links:', error);
      } else {
        setLinksData(data as Link[]); // Assert the data type here
      }
    };
    
    fetchLinks();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
      <div className="p-4 sm:p-6 xl:p-7.5 flex-grow overflow-hidden">
        <div className="max-h-full overflow-y-auto">
          <table className="w-full table-auto">
            <thead className="sticky top-0 bg-gray-2 dark:bg-meta-4">
              <tr className="text-left">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Type
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Link
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {linksData.map((link) => (
                <tr key={link.id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {link.type}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 dark:text-blue-400 hover:underline break-all"
                    >
                      {link.link}
                    </a>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {link.description || 'No description available'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableTwo;
