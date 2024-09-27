'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for your data
interface Bug {
  bug: string;
}

interface Todo {
  todo: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

// Define the props for ProjectTable
interface ProjectTableProps {
  project: Project;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ project }) => {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchBugsAndTodos = async () => {
      const { data: bugsData, error: bugsError } = await supabase
        .from<Bug>('bugs') // Table name and expected row type
        .select('bug')
        .eq('project_name', project.name);

      if (bugsError) console.error('Error fetching bugs:', bugsError);
      else if (bugsData) setBugs(bugsData);

      const { data: todosData, error: todosError } = await supabase
        .from<Todo>('todo') // Table name and expected row type
        .select('todo')
        .eq('project_name', project.name);

      if (todosError) console.error('Error fetching todos:', todosError);
      else if (todosData) setTodos(todosData);
    };

    fetchBugsAndTodos();
  }, [project.name]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 mb-4">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        {project.name}
      </h4>

      {project.status === 'T-Stop' ? (
        <p className="text-red mb-6">This project is temporarily stopped.</p>
      ) : (
        <div className="flex flex-col">
          {(project.status === 'U-Dev' || project.status === 'O-Prod') && (
            <div className="flex flex-col border-b border-stroke dark:border-strokedark pb-4 mb-4">
              <h5 className="text-lg font-medium text-black dark:text-white mb-2">
                Reported Bugs
              </h5>
              <ul className="list-disc pl-5 mb-2">
                {bugs.map((bug, index) => (
                  <li key={index} className="text-black dark:text-white">
                    {bug.bug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.status === 'U-Dev' && (
            <div className="flex flex-col border-b border-stroke dark:border-strokedark pb-4 mb-4">
              <h5 className="text-lg font-medium text-black dark:text-white mb-2">
                To-Do Tasks
              </h5>
              <ul className="list-disc pl-5">
                {todos.map((todo, index) => (
                  <li key={index} className="text-black dark:text-white">
                    {todo.todo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectTables: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from<Project>('projects') // Table name and expected row type
        .select('*');

      if (error) console.error('Error fetching projects:', error);
      else if (data) setProjects(data);
    };

    fetchProjects();
  }, []);

  return (
    <div>
      {projects.map((project) => (
        <ProjectTable key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectTables;
