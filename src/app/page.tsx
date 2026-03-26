"use client";

import { useEffect, useState, useCallback } from "react";
import TodoCard from "@/components/TodoCard";
import StreakCounter from "@/components/StreakCounter";
import ProgressRing from "@/components/ProgressRing";
import QuickAddTodo from "@/components/QuickAddTodo";

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

interface Stats {
  completionByType: Record<string, { completed: number; total: number; rate: number }>;
  streak: number;
  todayProgress: { completed: number; total: number; rate: number };
  overdue: number;
}

export default function Dashboard() {
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [todosRes, statsRes] = await Promise.all([
        fetch("/api/todos?type=daily"),
        fetch("/api/stats"),
      ]);
      const todos = await todosRes.json();
      const statsData = await statsRes.json();

      // Filter to today's todos
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const filtered = todos.filter((t: Todo) => {
        const due = new Date(t.dueDate);
        return due >= today && due <= todayEnd;
      });

      setTodayTodos(filtered);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickAdd = async (todo: {
    title: string;
    type: string;
    priority: string;
    dueDate: string;
    tags: string[];
  }) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    fetchData();
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StreakCounter streak={stats?.streak ?? 0} />

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats?.todayProgress.total ?? 0}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Today&apos;s tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats?.todayProgress.completed ?? 0}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Completed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats?.overdue ?? 0}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Overdue</p>
          </div>
        </div>
      </div>

      {/* Progress rings */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Completion Rates
        </h2>
        <div className="flex flex-wrap justify-around gap-6">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((type) => {
            const data = stats?.completionByType[type];
            const colors: Record<string, string> = {
              daily: "#3b82f6",
              weekly: "#8b5cf6",
              monthly: "#f97316",
              yearly: "#ec4899",
            };
            return (
              <ProgressRing
                key={type}
                progress={data?.rate ?? 0}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                sublabel={`${data?.completed ?? 0}/${data?.total ?? 0}`}
                color={colors[type]}
              />
            );
          })}
        </div>
      </div>

      {/* Quick add + Today's todos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Add
          </h2>
          <QuickAddTodo onAdd={handleQuickAdd} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Today&apos;s Todos
          </h2>
          {todayTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                No todos for today. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTodos.map((todo) => (
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
      </div>
    </div>
  );
}
