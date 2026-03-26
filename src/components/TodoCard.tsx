"use client";

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

interface TodoCardProps {
  todo: Todo;
  onToggleStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const typeColors: Record<string, string> = {
  daily: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  weekly: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  monthly: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  yearly: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
};

export default function TodoCard({ todo, onToggleStatus, onDelete }: TodoCardProps) {
  const isCompleted = todo.status === "completed";
  const nextStatus = isCompleted ? "pending" : todo.status === "pending" ? "in-progress" : "completed";

  return (
    <div
      className={`group rounded-xl border p-4 transition-all hover:shadow-md ${
        isCompleted
          ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleStatus(todo._id, nextStatus)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? "border-green-500 bg-green-500 text-white"
              : todo.status === "in-progress"
              ? "border-blue-500 bg-blue-100 dark:bg-blue-950"
              : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600"
          }`}
        >
          {isCompleted && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {todo.status === "in-progress" && (
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium ${
              isCompleted
                ? "text-zinc-400 line-through dark:text-zinc-600"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {todo.title}
            {todo.recurring && <span className="ml-1 text-xs">🔄</span>}
          </h3>

          {todo.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[todo.type]}`}>
              {todo.type}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
            {todo.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Due: {new Date(todo.dueDate).toLocaleDateString()}
            </span>
            <button
              onClick={() => onDelete(todo._id)}
              className="text-xs text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
