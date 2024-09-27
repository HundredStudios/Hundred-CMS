"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabseClient";
import { useEffect, useState, useCallback } from "react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [usrname, setUsrname] = useState("");
  const [note, setNote] = useState("");



  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        router.push("/login");
        return;
      }
  
      const { data, error, status } = await supabase
        .from("profiles")
        .select("name, phone_number, email, username, note")
        .eq("user_id", user.id)
        .single();
  
      if (error && status !== 406) {
        throw error;
      }
  
      if (data) {
        setName(data.name || "");
        setNum(data.phone_number || "");
        setEmail(data.email || "");
        setUsrname(data.username || "");
        setNote(data.note || "");
      }
    } catch (error) {
      console.error("Error loading user data!", error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        router.push("/login");
        return;
      }
  
      // Collect updates for fields
      const updates = {
        name,
        phone_number: num,
        email,
        username: usrname,
        note,
      };
  
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
  
      if (error) throw error;
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    
      // Check if the error is an instance of Error and access the message
      if (error instanceof Error) {
        alert(`Error updating profile: ${error.message}`);
      } else {
        // Fallback if the error is not an instance of Error
        alert("An unknown error occurred while updating the profile.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />
        <div className="grid gap-8 min-h-screen overflow-hidden">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={updateProfile}>
                  {/* Full Name */}
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="fullName"
                      >
                        Full Name
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="Phone Number"
                        value={num}
                        onChange={(e) => setNum(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Email Address
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="email"
                      name="emailAddress"
                      id="emailAddress"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      name="username"
                      id="username"
                      placeholder="Username"
                      value={usrname}
                      onChange={(e) => setUsrname(e.target.value)}
                      required
                    />
                  </div>

                  {/* Note */}
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="note"
                    >
                      Note
                    </label>
                    <textarea
                      className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      name="note"
                      id="note"
                      placeholder="Add a note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <button
                    className="rounded bg-primary py-2 px-4 text-white disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;
