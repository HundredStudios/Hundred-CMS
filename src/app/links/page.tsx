'use client'
import { useState, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableTwo from "@/components/Tables/TableTwo";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

const TablesPage = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    link: "",
    description: "",
  });

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Insert data into Supabase
    const { data, error } = await supabase
      .from("links")
      .insert([formData]);
  
    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted successfully:", data);
      setShowOverlay(false); // Close the overlay after submission
      window.location.reload(); // Refresh to display the updated table (or use a more efficient method to update table)
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl min-h-screen min-w-screen">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Breadcrumb pageName="Links" />
          <button
            onClick={() => setShowOverlay(true)}
            className="bg-primary text-white px-4 py-2 rounded-md mt-4 sm:mt-0"
          >
            Add Link
          </button>
        </div>

        <div className="w-full overflow-hidden">
          <TableTwo />
        </div>
      </div>

      {/* Overlay for the form */}
      {showOverlay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Add New Link
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md dark:border-strokedark dark:bg-boxdark"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md dark:border-strokedark dark:bg-boxdark"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-md dark:border-strokedark dark:bg-boxdark"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowOverlay(false)}
                  className="mr-2 bg-gray-300 dark:bg-strokedark text-black dark:text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default TablesPage;