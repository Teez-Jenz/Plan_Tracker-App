"use client";

import { useEffect, useState, useCallback } from "react";

interface Todo {
  _id: string;
  title: string;
  status: string;
}

interface Plan {
  _id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  todos: Todo[];
  notes: string;
  createdAt: string;
}

const types = ["all", "daily", "weekly", "monthly", "yearly"] as const;

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableTodos, setAvailableTodos] = useState<Todo[]>([]);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    type: "weekly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  const fetchPlans = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeType !== "all") params.set("type", activeType);

    const res = await fetch(`/api/plans?${params}`);
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  }, [activeType]);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos?status=pending");
    const data = await res.json();
    setAvailableTodos(data);
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchTodos();
  }, [fetchPlans, fetchTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        todos: selectedTodos,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }),
    });
    setForm({
      title: "",
      type: "weekly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: "",
    });
    setSelectedTodos([]);
    setShowForm(false);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const toggleTodoSelection = (todoId: string) => {
    setSelectedTodos((prev) =>
      prev.includes(todoId)
        ? prev.filter((id) => id !== todoId)
        : [...prev, todoId]
    );
  };

  const getProgress = (todos: Todo[]) => {
    if (todos.length === 0) return 0;
    const completed = todos.filter((t) => t.status === "completed").length;
    return Math.round((completed / todos.length) * 100);
  };

  const typeColors: Record<string, string> = {
    daily: "border-l-blue-500",
    weekly: "border-l-purple-500",
    monthly: "border-l-orange-500",
    yearly: "border-l-pink-500",
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Plans
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Organize todos into plans
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Plan"}
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
                Plan Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="e.g., Week 12 Focus Plan"
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
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Start
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  End
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {/* Todo selection */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Attach Todos ({selectedTodos.length} selected)
              </label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                {availableTodos.length === 0 ? (
                  <p className="p-2 text-sm text-zinc-400">
                    No pending todos available
                  </p>
                ) : (
                  availableTodos.map((todo) => (
                    <label
                      key={todo._id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTodos.includes(todo._id)}
                        onChange={() => toggleTodoSelection(todo._id)}
                        className="rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {todo.title}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Plan
            </button>
          </div>
        </form>
      )}

      {/* Type tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
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

      {/* Plans list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            No plans found. Create one to organize your todos!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const progress = getProgress(plan.todos);
            return (
              <div
                key={plan._id}
                className={`rounded-xl border border-l-4 border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 ${
                  typeColors[plan.type] || ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {plan.title}
                      </h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {plan.type}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(plan.startDate).toLocaleDateString()} –{" "}
                      {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                    {plan.notes && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {plan.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="text-sm text-zinc-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      {plan.todos.filter((t) => t.status === "completed").length}
                      /{plan.todos.length} tasks
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Todo list in plan */}
                {plan.todos.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {plan.todos.map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            todo.status === "completed"
                              ? "bg-green-500"
                              : "bg-zinc-300 dark:bg-zinc-600"
                          }`}
                        />
                        <span
                          className={
                            todo.status === "completed"
                              ? "text-zinc-400 line-through dark:text-zinc-600"
                              : "text-zinc-700 dark:text-zinc-300"
                          }
                        >
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
