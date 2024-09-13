import { useState } from "react";

const tasksData = [
  { title: "Tasks Completed", progress: 75 },
  { title: "Progress", progress: 50 },
  { title: "Reported Bugs", bugs: ["Bug 1: Issue with login", "Bug 2: UI misalignment"] },
  { title: "To-Do Tasks", tasks: ["Task 1: Update documentation", "Task 2: Fix bugs", "Task 3: Prepare release notes"] },
];

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const TableTwo = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Project Overview
      </h4>

      {/* Top Row with Icon and Project Name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src="/path/to/icon.svg" alt="Project Icon" className="h-8 w-8 mr-2" />
          <span className="text-lg font-medium text-black dark:text-white">Project Name</span>
        </div>
        <div className="flex items-center">
          {/* Add your right-side icons here */}
          <img src="/path/to/icon1.svg" alt="Icon 1" className="h-6 w-6 mx-1" />
          <img src="/path/to/icon2.svg" alt="Icon 2" className="h-6 w-6 mx-1" />
        </div>
      </div>

      {/* Content Rows */}
      <div className="flex flex-col">
        {tasksData.map((task, key) => (
          <div
            className={`flex flex-col border-b border-stroke dark:border-strokedark pb-4 ${
              key === tasksData.length - 1 ? "" : "mb-4"
            }`}
            key={key}
          >
            <h5 className="text-lg font-medium text-black dark:text-white mb-2">
              {task.title}
            </h5>
            
            {task.progress !== undefined ? (
              <ProgressBar progress={task.progress} />
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  {task.bugs && (
                    <ul className="list-disc pl-5 mb-2">
                      {task.bugs.map((bug, index) => (
                        <li key={index} className="text-black dark:text-white">
                          {bug}
                        </li>
                      ))}
                    </ul>
                  )}
                  {task.tasks && (
                    <ul className="list-disc pl-5">
                      {task.tasks.map((task, index) => (
                        <li key={index} className="text-black dark:text-white">
                          {task}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-right">
                  {/* Add a link here */}
                  <a href="#" className="text-blue-500 hover:underline">View More</a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableTwo;
