'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabseClient";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface Task {
  id: number;
  task: string;
  source: 'bugs' | 'todo';
  status?: string;
}

const Profile = () => {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("/images/user/user-06.png");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getProfileAndTasks = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
  
        if (!user) {
          router.push('/login');
          return;
        }
  
        // Fetch profile data
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', user.id)
          .single();
  
        if (profileError && profileError.code !== '406') {
          throw profileError;
        }
  
        if (profileData) {
          setName(profileData.username || '');
          setProfileImage(profileData.avatar_url || '/images/user/user-06.png');

          // Fetch bugs assigned to the user
          const { data: bugsData, error: bugsError } = await supabase
            .from('bugs')
            .select('id, bug')
            .eq('takenBy', profileData.username);

          if (bugsError) throw bugsError;

          // Fetch todos assigned to the user
          const { data: todosData, error: todosError } = await supabase
            .from('todo')
            .select('id, todo')
            .eq('takenBy', profileData.username);

          if (todosError) throw todosError;

          // Combine and format tasks
          const combinedTasks = [
            ...(bugsData || []).map(bug => ({ 
              id: bug.id, 
              task: bug.bug, 
              source: 'bugs' as const 
            })),
            ...(todosData || []).map(todo => ({ 
              id: todo.id, 
              task: todo.todo, 
              source: 'todo' as const 
            }))
          ];

          setTasks(combinedTasks);
        }
      } catch (error) {
        console.error('Error loading user data and tasks!', error);
      } finally {
        setLoading(false);
      }
    };
  
    getProfileAndTasks();
  }, [router]);
  
  const updateProfile = async (newAvatarUrl = null) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      const updates = {
        name: name || null,
        avatar_url: newAvatarUrl || profileImage,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update({ name: name })
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating the data!', error);
      alert('There was an error updating your profile. Please try again.');
    } finally {
      setLoading(false);
      setIsEditing(false);
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
  
        let { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);
  
        if (uploadError) throw uploadError;
  
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
  
        const publicUrl = data?.publicUrl;
  
        if (!publicUrl) throw new Error("Failed to get public URL");
  
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);
  
        if (updateError) throw updateError;
  
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
              {tasks.length > 0 ? (
                <div className="mt-4 max-w-xl mx-auto">
                  <ul className="space-y-3">
                    {tasks.map(task => (
                      <li 
                        key={`${task.source}-${task.id}`} 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          task.source === 'bugs' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.source === 'bugs' ? 'Bug' : 'Todo'}
                        </span>
                        <span className="text-gray-700">{task.task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-gray-500">No tasks assigned to you yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;