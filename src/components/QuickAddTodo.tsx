"use client";

import { useState } from "react";

interface QuickAddTodoProps {
  onAdd: (todo: {
    title: string;
    type: string;
    priority: string;
    dueDate: string;
    tags: string[];
  }) => void;
}

export default function QuickAddTodo({ onAdd }: QuickAddTodoProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("daily");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date();
    let dueDate = new Date();

    switch (type) {
      case "daily":
        dueDate = today;
        break;
      case "weekly":
        dueDate.setDate(today.getDate() + (7 - today.getDay()));
        break;
      case "monthly":
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "yearly":
        dueDate = new Date(today.getFullYear(), 11, 31);
        break;
    }

    onAdd({
      title: title.trim(),
      type,
      priority,
      dueDate: dueDate.toISOString(),
      tags: [],
    });

    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add a todo..."
          className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </form>
  );
}
