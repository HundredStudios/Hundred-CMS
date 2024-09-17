import React, { useState } from "react";

const TaskOverlay = ({ onAddTask, onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask({ title, date });
    setTitle("");
    setDate("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark">
        <h2 className="mb-4 text-2xl font-bold">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block font-bold">
              Title
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
            <label htmlFor="date" className="mb-2 block font-bold">
              Deadline
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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