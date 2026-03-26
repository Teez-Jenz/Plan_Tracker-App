"use client";

interface HeatmapDay {
  date: string;
  completed: number;
  total: number;
}

interface ConsistencyHeatmapProps {
  data: HeatmapDay[];
}

function getIntensity(completed: number, total: number): string {
  if (total === 0) return "bg-zinc-100 dark:bg-zinc-800";
  const ratio = completed / total;
  if (ratio === 0) return "bg-zinc-100 dark:bg-zinc-800";
  if (ratio < 0.25) return "bg-green-200 dark:bg-green-900";
  if (ratio < 0.5) return "bg-green-300 dark:bg-green-700";
  if (ratio < 0.75) return "bg-green-400 dark:bg-green-600";
  return "bg-green-500 dark:bg-green-500";
}

export default function ConsistencyHeatmap({ data }: ConsistencyHeatmapProps) {
  // Build 90-day grid
  const days: (HeatmapDay | null)[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    days.push(dataMap.get(key) || { date: key, completed: 0, total: 0 });
  }

  // Organize into weeks (columns)
  const weeks: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  // Pad the first week
  const firstDay = new Date(days[0]!.date + "T00:00:00");
  const dayOfWeek = firstDay.getDay();
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Consistency (Last 90 Days)
      </h3>
      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`h-3 w-3 rounded-sm ${
                  day ? getIntensity(day.completed, day.total) : "bg-transparent"
                }`}
                title={
                  day
                    ? `${day.date}: ${day.completed}/${day.total} completed`
                    : ""
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700" />
          <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-600" />
          <div className="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
