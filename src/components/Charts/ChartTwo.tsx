"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Circle, CheckCircle2, User } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface BugData {
  id: number;
  bug: string;
  project_name: string;
  takenBy: string | null;
  done: boolean;
}

interface TodoData {
  id: number;
  todo: string;
  project_name: string;
  takenBy: string | null;
  done: boolean;
}

const dropdownVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } }
};

const ChartTwo: React.FC = () => {
  const [bugs, setBugs] = useState<BugData[]>([]);
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [bugDropdownIndex, setBugDropdownIndex] = useState<number | null>(null);
  const [todoDropdownIndex, setTodoDropdownIndex] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  

  useEffect(() => {
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

    const fetchData = async () => {
      const [bugsResult, todoResult] = await Promise.all([
        supabase
          .from("bugs")
          .select("id, bug, project_name, takenBy, done") // No alias here
          .eq("done", false),
        supabase
          .from("todo")
          .select("id, todo, project_name, takenBy, done")
          .eq("done", false)
      ]);
    
      if (bugsResult.error) {
        console.error("Error fetching bugs:", bugsResult.error);
      } else {
        // Ensure the fetched data conforms to the BugData type
        setBugs(bugsResult.data as BugData[] || []); // Use type assertion
      }
    
      if (todoResult.error) {
        console.error("Error fetching todos:", todoResult.error);
      } else {
        setTodos(todoResult.data || []);
      }
    };
    
    

    fetchUserData();
    fetchData();
  }, []);

  const handleTakeTask = async (task: BugData | TodoData, type: "bug" | "todo") => {
    console.log(`Taking task: ${task.id}, Type: ${type}, Current User: ${currentUser}`);
  
    try {
      const { error } = await supabase
        .from(type === "bug" ? "bugs" : "todo")
        .update({ takenBy: currentUser })
        .eq("id", task.id);
  
      if (error) {
        console.error("Error taking task:", error.message);
        return;
      }
  
      const updateState = (prevItems: any[]) => 
        prevItems.map(item => 
          item.id === task.id ? { ...item, takenBy: currentUser } : item
        );
  
      type === "bug" ? setBugs(updateState) : setTodos(updateState);
    } catch (error) {
      console.error("Failed to take task:", error);
    }
  };
  

  const handleMarkDone = async (task: BugData | TodoData, type: "bug" | "todo") => {
    try {
      const { error } = await supabase
        .from(type === "bug" ? "bugs" : "todo")
        .update({ done: true })
        .eq("id", task.id);

      if (error) {
        console.error("Error marking task as done:", error);
        return;
      }

      const updateState = (prevItems: any[]) => 
        prevItems.filter(item => item.id !== task.id);

      type === "bug" ? setBugs(updateState) : setTodos(updateState);
    } catch (error) {
      console.error("Failed to mark task as done:", error);
    }
  };

  const TaskActions = ({ task }: { task: BugData | TodoData }) => {
    if (!task.takenBy) {
      return (
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors duration-200"
          onClick={() => handleTakeTask(task, 'bug' in task ? "bug" : "todo")}
        >
          <Circle className="w-3 h-3" />
          <span className="font-medium text-sm">Take Task</span>
        </motion.button>
      );
    }

    if (task.takenBy === currentUser) {
      return (
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors duration-200"
          onClick={() => handleMarkDone(task, 'bugs' in task ? "bug" : "todo")}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span className="font-medium text-sm">Done</span>
        </motion.button>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-400">
        <User className="w-4 h-4" />
        <span className="text-sm">Task taken by {task.takenBy}</span>
      </div>
    );
  };

  const TaskItem = ({ 
    item, 
    index, 
    type,
    isDropdownOpen,
    onToggleDropdown 
  }: {
    item: BugData | TodoData;
    index: number;
    type: "bug" | "todo";
    isDropdownOpen: boolean;
    onToggleDropdown: () => void;
  }) => (
    <li className="mb-4 last:mb-0">
      <div className="flex items-start gap-3">
        <div className="mt-1.5 flex-shrink-0">
          <motion.div
            initial={false}
            animate={{ rotate: isDropdownOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4"
          >
            <button
              onClick={onToggleDropdown}
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-sm text-white font-bold tracking-wide">
              {type === "bug" ? (item as BugData).bug : (item as TodoData).todo}
            </span>
            <span className="text-[10px] text-gray-400 ml-2 font-normal">
              ({item.project_name})
            </span>
          </div>
          <AnimatePresence mode="wait">
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="ml-2 mt-3 overflow-hidden"
              >
                <TaskActions task={item} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );

  const TaskList = ({ 
    items, 
    type, 
    dropdownIndex, 
    setDropdownIndex 
  }: {
    items: (BugData | TodoData)[];
    type: "bug" | "todo";
    dropdownIndex: number | null;
    setDropdownIndex: (index: number | null) => void;
  }) => (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <TaskItem
          key={item.id}
          item={item}
          index={index}
          type={type}
          isDropdownOpen={dropdownIndex === index}
          onToggleDropdown={() => setDropdownIndex(dropdownIndex === index ? null : index)}
        />
      ))}
    </ul>
  );

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-boxdark p-7.5 shadow-default dark:border-strokedark xl:col-span-4">
      <div className="mb-8">
        <h5 className="text-lg font-medium text-white mb-4">Bugs</h5>
        <TaskList
          items={bugs}
          type="bug"
          dropdownIndex={bugDropdownIndex}
          setDropdownIndex={setBugDropdownIndex}
        />
      </div>

      <div>
        <h5 className="text-lg font-medium text-white mb-4">To-Do Tasks</h5>
        <TaskList
          items={todos}
          type="todo"
          dropdownIndex={todoDropdownIndex}
          setDropdownIndex={setTodoDropdownIndex}
        />
      </div>
    </div>
  );
};

export default ChartTwo;