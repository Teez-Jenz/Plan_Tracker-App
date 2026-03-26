"use client";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  suggestedType: string;
  suggestedPriority: string;
  suggestedTags: string[];
  category: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (suggestion: Suggestion) => void;
  onDismiss: (id: string) => void;
}

const categoryIcons: Record<string, string> = {
  recurring: "🔄",
  breakdown: "📦",
  related: "🔗",
  carryover: "📌",
};

const categoryLabels: Record<string, string> = {
  recurring: "Recurring Pattern",
  breakdown: "Goal Breakdown",
  related: "Related Task",
  carryover: "Carry Forward",
};

export default function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: SuggestionCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl">
            {categoryIcons[suggestion.category] || "💡"}
          </span>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                {categoryLabels[suggestion.category] || suggestion.category}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {suggestion.suggestedType}
              </span>
            </div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              {suggestion.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {suggestion.description}
            </p>
            {suggestion.suggestedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestion.suggestedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Dismiss
        </button>
        <button
          onClick={() => onAccept(suggestion)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Add as Todo
        </button>
      </div>
    </div>
  );
}
