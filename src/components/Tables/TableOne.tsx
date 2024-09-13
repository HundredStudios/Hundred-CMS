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

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Project Overview
      </h4>

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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
