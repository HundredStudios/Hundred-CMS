import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the props type for TaskOverlay
interface TaskOverlayProps {
  onClose: () => void;
}

const TaskOverlay: React.FC<TaskOverlayProps> = ({ onClose }) => {
  const [title, setTitle] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("todo"); // default to 'todo'
  const [projects, setProjects] = useState<{ name: string }[]>([]);

  // Fetch project data from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("name");

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const taskData = {
      project_name: project,
      deadline,
      done: false,
    };

    // Insert into the respective table based on taskType (todo/bug)
    try {
      if (taskType === "todo") {
        const todoData = { ...taskData, todo: title }; // update title in 'todo' column
        const { error } = await supabase.from("todo").insert([todoData]);
        if (error) throw error;
      } else if (taskType === "bugs") {
        const bugData = { ...taskData, bug: title }; // update title in 'bug' column
        const { error } = await supabase.from("bugs").insert([bugData]);
        if (error) throw error;
      }

      // Reset form after submission
      setTitle("");
      setDeadline("");
      setProject("");
      setTaskType("todo");
      onClose();
    } catch (error) {
      console.error("Error inserting task:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark">
        <h2 className="mb-4 text-2xl font-bold">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block font-bold">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-meta-4"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="project" className="mb-2 block font-bold">
              Project
            </label>
            <select
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-meta-4"
              required
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((proj) => (
                <option key={proj.name} value={proj.name}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="taskType" className="mb-2 block font-bold">
              Task Type
            </label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-meta-4"
              required
            >
              <option value="todo">ToDo</option>
              <option value="bugs">Bug</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="deadline" className="mb-2 block font-bold">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-meta-4"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskOverlay;
