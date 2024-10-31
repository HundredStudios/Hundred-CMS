"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import TaskOverlay from "./TaskOverlay";
import { RiCheckDoubleLine } from "react-icons/ri";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Calendar = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Date[] = [];
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalendarDays(days);
  }, [currentDate]);
  const fetchUserData = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }
    
    if (userData.user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userData.user.id)
        .single();
  
      if (!error && profile) {
        setCurrentUser(profile.username);
      }
    }
  };
  type TaskType = {
    bug: string; // Adjust according to your schema
    todo: string; // Adjust according to your schema
    takenBy?: string | null; // Optional field for takenBy
    deadline: string; // Should match the format you're using
    type: 'bug' | 'todo'; // Task type
    avatar?: string | null; // Avatar URL
  };
  
  type Profile = {
    username: string;
    avatar_url: string;
  };
  
  const fetchTasks = useCallback(async () => {
    if (calendarDays.length === 0) return;
  
    const startDate = calendarDays[0].toISOString().split('T')[0];
    const endDate = calendarDays[calendarDays.length - 1].toISOString().split('T')[0];
  
    try {
      const [{ data: bugs }, { data: todos }] = await Promise.all([
        supabase.from('bugs').select('*').eq('done', false).gte('deadline', startDate).lte('deadline', endDate),
        supabase.from('todo').select('*').eq('done', false).gte('deadline', startDate).lte('deadline', endDate)
      ]);
  
      const userIds = new Set([
        ...(bugs || []).map(bug => bug.takenBy).filter(Boolean),
        ...(todos || []).map(todo => todo.takenBy).filter(Boolean)
      ]);
  
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .in('username', Array.from(userIds));
  
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return;
      }
  
      const profileMap: { [key: string]: string } = profiles.reduce((acc: { [key: string]: string }, profile) => {
        acc[profile.username] = profile.avatar_url;
        return acc;
      }, {});
  
      const allTasks: TaskType[] = [
        ...(bugs || []).map(bug => ({
          ...bug,
          type: 'bug',
          taskTitle: bug.bug,
          avatar: profileMap[bug.takenBy] || null
        })),
        ...(todos || []).map(todo => ({
          ...todo,
          type: 'todo',
          taskTitle: todo.todo,
          avatar: profileMap[todo.takenBy] || null
        })),
      ].map(task => ({
        ...task,
        deadline: new Date(task.deadline).toISOString().split('T')[0]
      }));
  
      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [calendarDays]);
  
  const renderTask = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const tasksForDate = tasks.filter(t => t.deadline === dateStr);
  
    if (tasksForDate.length > 0) {
      return (
        <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
          <span className="group-hover:text-primary md:hidden">{tasksForDate.length} task(s)</span>
          <div className="event invisible absolute left-0 z-50 mb-1 flex w-full flex-col rounded-sm border-l-[3px] border-primary bg-gray px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-meta-4 md:visible md:opacity-100">
            {tasksForDate.map((task, index) => (
              <div key={index} className="mb-1 last:mb-0 flex items-center">
                {/* Render user avatar using Next.js Image component */}
                {task.avatar && (
                  <Image
                    src={task.avatar}
                    alt={`${task.takenBy} avatar`}
                    className="mr-2 h-6 w-6 rounded-full"
                    width={24}
                    height={24}
                  />
                )}
                <span className="event-name text-sm font-semibold text-black dark:text-white">
                  {task.taskTitle} ({task.type === 'bug' ? 'Bug' : 'Todo'})
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  
  
  
  
  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  useEffect(() => {
    if (calendarDays.length > 0) {
      fetchTasks();
    }
  }, [calendarDays, fetchTasks]);

  const markTaskAsDone = async (taskId: number, taskType: string) => {
    const table = taskType === 'bug' ? 'bugs' : 'todo';
    try {
      const { error } = await supabase
        .from(table)
        .update({ done: true })
        .eq('id', taskId);

      if (error) throw error;

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

 

const renderCalendar = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <table className="w-full">
      <thead>
        <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <th key={index} className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
              <span className="hidden lg:block">{day}</span>
              <span className="block lg:hidden">{day.substring(0, 3)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
          <tr key={weekIndex} className="grid grid-cols-7">
            {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
              const taskDate = new Date(day);
              taskDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

              const isToday = taskDate.toISOString() === today.toISOString();
              const isInCurrentMonth = taskDate.getMonth() === currentDate.getMonth();

              return (
                <td 
                  key={dayIndex} 
                  className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
                    !isInCurrentMonth ? 'bg-gray-100' : ''
                  } ${isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                >
                  <span className={`font-medium ${isInCurrentMonth ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                    {taskDate.getDate()}
                  </span>
                  {renderTask(taskDate)} {/* Render the task box */}

                  {/* Check if there are tasks for the day */}
                  {tasks.some(task => task.deadline === taskDate.toISOString().split('T')[0]) }
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

  
  

  const renderOutOfScopeTasks = () => {
    const outOfScopeTasks = tasks.filter(task => {
      return task.deadline > calendarDays[calendarDays.length - 1].toISOString().split('T')[0];
    });

    if (outOfScopeTasks.length === 0) return null;

    return (
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Tasks with deadlines beyond this calendar view</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-2">Deadline</th>
              <th className="p-2">Title</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {outOfScopeTasks.map((task, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="p-2">{new Date(task.deadline).toLocaleDateString()}</td>
                <td className="p-2">{task.title || task.description}</td>
                <td className="p-2">
                  <button
                    onClick={() => markTaskAsDone(task.id, task.type)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Mark as Done
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{getMonthName(currentDate)} {currentDate.getFullYear()}</h1>
        <div>
          <button onClick={handlePreviousMonth} className="mx-2 text-blue-500 hover:underline">Previous</button>
          <button onClick={handleNextMonth} className="mx-2 text-blue-500 hover:underline">Next</button>
        </div>
      </div>
      {/* <Breadcrumb /> */}
      <button 
        onClick={() => setShowOverlay(true)} 
        className="mb-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-300"
      >
        Add Task
      </button>
      {renderCalendar()}
      {renderOutOfScopeTasks()}
      {showOverlay && <TaskOverlay onClose={() => setShowOverlay(false)} />}
    </div>
  );
};

export default Calendar;