"use client";

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
        <span className="text-2xl">🔥</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {streak} {streak === 1 ? "day" : "days"}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Current streak
        </p>
      </div>
    </div>
  );
}
