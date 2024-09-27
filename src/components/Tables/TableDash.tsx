'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-300 dark:bg-gray-800 rounded-full h-3">
      <div
        className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

interface Project {
  name: string;
  status: string;
}

interface Bug {
  bug: string;
}

interface Todo {
  todo: string;
}

const ProjectTable: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) console.error('Error fetching projects:', error);
      else {
        setProjects(data as Project[]);
        if (data.length > 0) setSelectedProject(data[0] as Project);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchBugsAndTodos = async () => {
      if (selectedProject) {
        const { data: bugsData, error: bugsError } = await supabase
          .from('bugs')
          .select('bug')
          .eq('project_name', selectedProject.name);
        if (bugsError) console.error('Error fetching bugs:', bugsError);
        else setBugs(bugsData as Bug[]);

        const { data: todosData, error: todosError } = await supabase
          .from('todo')
          .select('todo')
          .eq('project_name', selectedProject.name);
        if (todosError) console.error('Error fetching todos:', todosError);
        else setTodos(todosData as Todo[]);
      }
    };
    fetchBugsAndTodos();
  }, [selectedProject]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const project = projects.find((p) => p.name === event.target.value) as Project; 
    setSelectedProject(project ?? null);
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-4 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="flex justify-between items-center mb-6 px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Project Details
        </h4>
        <select
          className="border border-gray-300 dark:border-strokedark bg-gray-100 dark:bg-boxdark rounded-md px-4 py-2 text-black dark:text-white ml-auto"
          onChange={handleProjectChange}
          value={selectedProject?.name || ''}
        >
          {projects.map((project) => (
            <option key={project.name} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col h-[400px] px-7.5">
        <div className="flex-grow overflow-y-auto mb-4 pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          <table className="min-w-full bg-gray-100 dark:bg-boxdark text-black dark:text-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <th className="text-left py-4 px-6 font-semibold text-sm">Project Name</th>
                <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedProject && (
                <tr className="border-t border-gray-200 dark:border-strokedark">
                  <td className="py-4 px-6">{selectedProject.name}</td>
                  <td className="py-4 px-6">{selectedProject.status}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div ref={messagesEndRef} />
        </div>

        {(selectedProject?.status === 'U-Dev' || selectedProject?.status === 'O-Prod') && (
          <div className="mt-6">
            <h3 className="font-bold text-lg text-black dark:text-white mb-2">Reported Bugs</h3>
            <ul className="list-disc list-inside ml-4 text-black dark:text-white">
              {bugs.map((bug, index) => (
                <li key={index}>{bug.bug}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedProject?.status === 'U-Dev' && (
          <div className="mt-6">
            <h3 className="font-bold text-lg text-black dark:text-white mb-2">To-Do Tasks</h3>
            <ul className="list-disc list-inside ml-4 text-black dark:text-white">
              {todos.map((todo, index) => (
                <li key={index}>{todo.todo}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
