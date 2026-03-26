"use client";

import { useEffect, useState, useCallback } from "react";
import TodoCard from "@/components/TodoCard";

interface Todo {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
  recurring: boolean;
}

const types = ["all", "daily", "weekly", "monthly", "yearly"] as const;
const statuses = ["all", "pending", "in-progress", "completed"] as const;

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "daily",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    tags: "",
    recurring: false,
  });

  const fetchTodos = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeType !== "all") params.set("type", activeType);
    if (activeStatus !== "all") params.set("status", activeStatus);

    const res = await fetch(`/api/todos?${params}`);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }, [activeType, activeStatus]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        dueDate: new Date(form.dueDate).toISOString(),
      }),
    });
    setForm({
      title: "",
      description: "",
      type: "daily",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      tags: "",
      recurring: false,
    });
    setShowForm(false);
    fetchTodos();
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTodos();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Todos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage all your tasks
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Todo"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="What needs to be done?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Optional details..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="work, health, learning"
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="recurring"
                checked={form.recurring}
                onChange={(e) =>
                  setForm({ ...form, recurring: e.target.checked })
                }
                className="rounded border-zinc-300"
              />
              <label
                htmlFor="recurring"
                className="text-sm text-zinc-700 dark:text-zinc-300"
              >
                Recurring task
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Todo
            </button>
          </div>
        </form>
      )}

      {/* Type tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeType === type
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="mb-6 flex gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeStatus === status
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {status === "all"
              ? "All"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            No todos found. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
