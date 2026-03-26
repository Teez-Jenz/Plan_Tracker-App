"use client";

interface ProgressRingProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  color?: string;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = "#3b82f6",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {progress}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
        {sublabel && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
