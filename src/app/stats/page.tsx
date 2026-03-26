"use client";

import { useEffect, useState } from "react";
import ConsistencyHeatmap from "@/components/ConsistencyHeatmap";
import ProgressRing from "@/components/ProgressRing";
import StreakCounter from "@/components/StreakCounter";

interface Stats {
  completionByType: Record<
    string,
    { completed: number; total: number; rate: number }
  >;
  streak: number;
  heatmap: { date: string; completed: number; total: number }[];
  overdue: number;
  todayProgress: { completed: number; total: number; rate: number };
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  const typeColors: Record<string, string> = {
    daily: "#3b82f6",
    weekly: "#8b5cf6",
    monthly: "#f97316",
    yearly: "#ec4899",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Statistics
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track your consistency and progress
        </p>
      </div>

      {/* Top stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StreakCounter streak={stats.streak} />

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.overdue}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Overdue tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.todayProgress.rate}%
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Today&apos;s completion
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-8">
        <ConsistencyHeatmap data={stats.heatmap} />
      </div>

      {/* Completion by type */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Completion by Type
        </h2>
        <div className="flex flex-wrap justify-around gap-8">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((type) => {
            const data = stats.completionByType[type];
            return (
              <ProgressRing
                key={type}
                progress={data?.rate ?? 0}
                size={140}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                sublabel={`${data?.completed ?? 0} of ${data?.total ?? 0} tasks`}
                color={typeColors[type]}
              />
            );
          })}
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Detailed Breakdown
        </h2>
        <div className="space-y-4">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((type) => {
            const data = stats.completionByType[type];
            return (
              <div key={type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {data?.completed ?? 0}/{data?.total ?? 0} ({data?.rate ?? 0}
                    %)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${data?.rate ?? 0}%`,
                      backgroundColor: typeColors[type],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
