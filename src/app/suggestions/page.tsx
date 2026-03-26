"use client";

import { useEffect, useState, useCallback } from "react";
import SuggestionCard from "@/components/SuggestionCard";

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

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    const res = await fetch("/api/suggestions");
    const data = await res.json();
    setSuggestions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleAccept = async (suggestion: Suggestion) => {
    const today = new Date();
    let dueDate = new Date();

    switch (suggestion.suggestedType) {
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

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.suggestedType,
        priority: suggestion.suggestedPriority,
        dueDate: dueDate.toISOString(),
        tags: suggestion.suggestedTags,
        recurring: suggestion.category === "recurring",
      }),
    });

    // Remove from list
    setDismissed((prev) => new Set(prev).add(suggestion.id));
    fetchSuggestions();
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = suggestions.filter((s) => !dismissed.has(s.id));

  const grouped = {
    carryover: visible.filter((s) => s.category === "carryover"),
    recurring: visible.filter((s) => s.category === "recurring"),
    breakdown: visible.filter((s) => s.category === "breakdown"),
    related: visible.filter((s) => s.category === "related"),
  };

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    carryover: { label: "Carry Forward", icon: "📌" },
    recurring: { label: "Recurring Patterns", icon: "🔄" },
    breakdown: { label: "Goal Breakdowns", icon: "📦" },
    related: { label: "Related Tasks", icon: "🔗" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Suggestions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Smart task suggestions based on your activity
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <div className="text-4xl mb-4">💡</div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            No suggestions right now
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Add more todos and complete tasks to get personalized suggestions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(
            Object.entries(grouped) as [
              string,
              Suggestion[],
            ][]
          ).map(([category, items]) => {
            if (items.length === 0) return null;
            const info = categoryLabels[category];
            return (
              <div key={category}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  <span>{info?.icon}</span>
                  {info?.label}
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-sm font-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {items.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {items.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={handleAccept}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
