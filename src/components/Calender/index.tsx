"use client";
import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import TaskOverlay from "./TaskOverlay";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);


const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    if (calendarDays.length > 0) {
      fetchTasks();
    }
  }, [calendarDays]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalendarDays(days);
    console.log("Calendar days generated:", days);
  };

  const fetchTasks = async () => {
    if (calendarDays.length === 0) {
      console.error('Calendar days not set');
      return;
    }

    const endDate = calendarDays[calendarDays.length - 1].toISOString().split('T')[0];
    console.log("Fetching tasks up to:", endDate);

    try {
      // Fetch bugs
      const { data: bugs, error: bugsError } = await supabase
        .from('bugs')
        .select('*')
        .eq('done', false)
        .lte('deadline', endDate);

      if (bugsError) throw bugsError;
      console.log("Fetched bugs:", bugs);

      // Fetch todos
      const { data: todos, error: todosError } = await supabase
        .from('todo')
        .select('*')
        .eq('done', false)
        .lte('deadline', endDate);

      if (todosError) throw todosError;
      console.log("Fetched todos:", todos);

      const allTasks = [...(bugs || []), ...(todos || [])].map(task => ({
        ...task,
        type: task.hasOwnProperty('severity') ? 'bug' : 'todo'
      }));

      console.log("All tasks:", allTasks);
      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };



  const markTaskAsDone = async (taskId, taskType) => {
    const table = taskType === 'bug' ? 'bugs' : 'todo';
    try {
      const { error } = await supabase
        .from(table)
        .update({ done: true })
        .eq('id', taskId);

      if (error) throw error;
      
      fetchTasks(); // Refresh tasks after marking as done
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const renderTask = (date) => {
   /*  console.log("Rendering tasks for date:", date.toISOString().split('T')[0]); */
    const tasksForDate = tasks.filter(t => {
      const taskDeadline = new Date(t.deadline);
      const isSameDate = taskDeadline.toISOString().split('T')[0] === date.toISOString().split('T')[0];
      console.log("Task:", t.title, "Deadline:", t.deadline, "Is on this date:", isSameDate);
      return isSameDate;
    });

    /* console.log("Tasks for date:", tasksForDate); */

    if (tasksForDate.length > 0) {
      return (
        <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
          <span className="group-hover:text-primary md:hidden">{tasksForDate.length} task(s)</span>
          <div className="event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-sm border-l-[3px] border-primary bg-gray px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-meta-4 md:visible md:w-[190%] md:opacity-100">
            {tasksForDate.map((task, index) => (
              <div key={index} className="mb-1">
                <span className="event-name text-sm font-semibold text-black dark:text-white">
                  {task.title || task.description}
                </span>
                <span className="time text-sm font-medium text-black dark:text-white ml-2">
                  (Due: {new Date(task.deadline).toLocaleDateString()})
                </span>
                <button
                  onClick={() => markTaskAsDone(task.id, task.type)}
                  className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  Mark as Done
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCalendar = () => {
    const today = new Date();
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
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                <td 
                  key={dayIndex} 
                  className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
                    day.getMonth() !== currentDate.getMonth() ? 'bg-gray-100' : ''
                  } ${
                    day.toDateString() === today.toDateString() ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <span className={`font-medium ${day.getMonth() === currentDate.getMonth() ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                    {day.getDate()}
                  </span>
                  {renderTask(day)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderOutOfScopeTasks = () => {
    const outOfScopeTasks = tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate > calendarDays[calendarDays.length - 1];
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

  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName={`Calendar - ${getMonthName(currentDate)} ${currentDate.getFullYear()}`} />

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setShowOverlay(true)}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          Add Task
        </button>
        <div>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="mr-2 rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Previous Month
          </button>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Next Month
          </button>
        </div>
      </div>

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {renderCalendar()}
      </div>

      {renderOutOfScopeTasks()}

      {showOverlay && (
        <TaskOverlay onAddTask={fetchTasks} onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
};

export default Calendar;