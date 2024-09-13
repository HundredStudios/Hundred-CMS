"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState } from "react";

const Profile = () => {
  const [name, setName] = useState("Danish Heilium");
  const [isEditing, setIsEditing] = useState(false);
  const tasks = ["Design new UI components", "Fix bugs in dashboard", "Update documentation"];
  const [profileImage, setProfileImage] = useState("/images/user/user-06.png");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(newImageUrl);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5 min-h-screen">
        <Breadcrumb pageName="Profile" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            <Image
              src={"/images/cover/cover-01.png"}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>

          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2 overflow-hidden rounded-full">
                <Image
                  src={profileImage}
                  width={160}
                  height={160}
                  className="object-cover rounded-full"  // Ensures the image fits in the circular frame
                  alt="profile"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>
            <div className="mt-4">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="mb-1.5 text-2xl font-semibold text-black dark:text-white bg-transparent border-b border-gray-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                  {name}
                </h3>
              )}
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={toggleEditing}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
              <p className="font-medium">Ui/Ux Designer</p>
            </div>

            {/* Your Tasks Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold">Your Tasks</h4>
              <ul className="list-disc list-inside mt-2">
                {tasks.map((task, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
