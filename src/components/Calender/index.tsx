"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import TaskOverlay from "./TaskOverlay";

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

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
  };

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowOverlay(false);
  };

  const renderTask = (date) => {
    const task = tasks.find((t) => t.date === date.toISOString().split('T')[0]);
    if (task) {
      return (
        <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
          <span className="group-hover:text-primary md:hidden">More</span>
          <div className="event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-sm border-l-[3px] border-primary bg-gray px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-meta-4 md:visible md:w-[190%] md:opacity-100">
            <span className="event-name text-sm font-semibold text-black dark:text-white">
              {task.title}
            </span>
            <span className="time text-sm font-medium text-black dark:text-white">
              {task.date}
            </span>
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
      const taskDate = new Date(task.date);
      return taskDate < calendarDays[0] || taskDate > calendarDays[calendarDays.length - 1];
    });

    if (outOfScopeTasks.length === 0) return null;

    return (
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Tasks not mentioned on the calender</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-2">Date</th>
              <th className="p-2">Title</th>
            </tr>
          </thead>
          <tbody>
            {outOfScopeTasks.map((task, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="p-2">{task.date}</td>
                <td className="p-2">{task.title}</td>
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
        <TaskOverlay onAddTask={addTask} onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
};

export default Calendar;