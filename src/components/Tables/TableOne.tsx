'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);



const ProjectTable = ({ project }) => {
  const [bugs, setBugs] = useState([]);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchBugsAndTodos = async () => {
      const { data: bugsData, error: bugsError } = await supabase
        .from('bugs')
        .select('bug')
        .eq('project_name', project.name);

      if (bugsError) console.error('Error fetching bugs:', bugsError);
      else setBugs(bugsData);

      const { data: todosData, error: todosError } = await supabase
        .from('todo')
        .select('todo')
        .eq('project_name', project.name);

      if (todosError) console.error('Error fetching todos:', todosError);
      else setTodos(todosData);
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

const ProjectTables = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) console.error('Error fetching projects:', error);
      else setProjects(data);
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