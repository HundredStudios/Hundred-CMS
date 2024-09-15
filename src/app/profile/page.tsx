"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabseClient";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const Profile = () => {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("/images/user/user-06.png");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const tasks = ["Design new UI components", "Fix bugs in dashboard", "Update documentation"];

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      let { data, error, status } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.name || '');
        setProfileImage(data.avatar_url || '/images/user/user-06.png');
      }
    } catch (error) {
      console.error('Error loading user data!', error);
    } finally {
      setLoading(false);
    }
  };

const updateProfile = async (newAvatarUrl = null) => {
  try {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No user logged in');

    const updates = {
      name: name || null, // Update the name
      avatar_url: newAvatarUrl || profileImage, // Update the avatar
      updated_at: new Date().toISOString(),
    };

    // Update the user's profile in the database using the update method
    const { error } = await supabase
      .from('profiles')
      .update({name: name})
      .eq('user_id', user.id); // Ensure we're updating the correct user's profile

    if (error) throw error; // Handle any errors

    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating the data!', error);
    alert('There was an error updating your profile. Please try again.');
  } finally {
    setLoading(false);
    setIsEditing(false);  // Exit editing mode
  }
};


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const toggleEditing = () => {
    if (isEditing) {
      updateProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${Date.now()}_${fileName}`;

      setUploadingImage(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Upload the image to Supabase Storage
        let { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL of the uploaded image
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (urlError) {
          throw urlError;
        }

        // Update the user's profile with the new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Update local state
        setProfileImage(publicUrl);
        alert('Profile image updated successfully!');
      } catch (error) {
        console.error('Error updating avatar:', error);
        alert('Error updating avatar. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
                  className="object-cover rounded-full"
                  alt="profile"
                />
                <label htmlFor="profile-image-upload" className="absolute inset-0 cursor-pointer">
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <span className="text-white">Uploading...</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className={`py-2 px-4 border ${isEditing ? 'border-gray-400' : 'border-transparent'} rounded-md`}
                disabled={!isEditing}
              />
              <button
                onClick={toggleEditing}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            <div className="mt-10">
              <h3 className="text-2xl font-semibold">Your Tasks</h3>
              <ul className="list-disc list-inside mt-4 text-left">
                {tasks.map((task, index) => (
                  <li key={index} className="text-gray-700">
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
