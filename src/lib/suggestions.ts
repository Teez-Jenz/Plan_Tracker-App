import { ITodo } from "@/lib/models/Todo";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  suggestedType: "daily" | "weekly" | "monthly" | "yearly";
  suggestedPriority: "low" | "medium" | "high";
  suggestedTags: string[];
  category: "recurring" | "breakdown" | "related" | "carryover";
}

// Common keywords that signal breakable goals
const BREAKDOWN_KEYWORDS: Record<string, string[]> = {
  learn: ["study basics", "practice exercises", "build a project", "review and revise"],
  build: ["research & plan", "set up environment", "implement core", "test & refine"],
  read: ["read 1 chapter", "take notes", "review notes", "discuss or summarize"],
  exercise: ["warm up routine", "cardio session", "strength training", "stretching & cool down"],
  write: ["outline structure", "write first draft", "edit & revise", "finalize & publish"],
  organize: ["sort & categorize", "declutter", "set up system", "maintain routine"],
  save: ["track expenses", "set budget", "reduce spending", "review progress"],
  health: ["meal prep", "exercise routine", "sleep schedule", "health checkup"],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Detect frequently occurring title patterns and suggest making them recurring
 */
function detectRecurringPatterns(todos: ITodo[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const titleCounts: Record<string, { count: number; type: ITodo["type"]; tags: string[] }> = {};

  for (const todo of todos) {
    const normalized = todo.title.toLowerCase().trim();
    if (!titleCounts[normalized]) {
      titleCounts[normalized] = { count: 0, type: todo.type, tags: todo.tags || [] };
    }
    titleCounts[normalized].count++;
  }

  for (const [title, info] of Object.entries(titleCounts)) {
    if (info.count >= 2) {
      const existing = todos.find(
        (t) => t.title.toLowerCase().trim() === title && t.recurring
      );
      if (!existing) {
        suggestions.push({
          id: generateId(),
          title: todos.find((t) => t.title.toLowerCase().trim() === title)?.title || title,
          description: `You've created "${title}" ${info.count} times. Consider making it a recurring task.`,
          reason: `Appeared ${info.count} times`,
          suggestedType: info.type,
          suggestedPriority: "medium",
          suggestedTags: info.tags,
          category: "recurring",
        });
      }
    }
  }

  return suggestions;
}

/**
 * For large goals (yearly/monthly), suggest breaking them into smaller tasks
 */
function suggestBreakdowns(todos: ITodo[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const bigGoals = todos.filter(
    (t) =>
      (t.type === "yearly" || t.type === "monthly") &&
      t.status !== "completed"
  );

  for (const goal of bigGoals) {
    const titleLower = goal.title.toLowerCase();
    const childType = goal.type === "yearly" ? "monthly" : "weekly";

    for (const [keyword, subtasks] of Object.entries(BREAKDOWN_KEYWORDS)) {
      if (titleLower.includes(keyword)) {
        for (const subtask of subtasks) {
          suggestions.push({
            id: generateId(),
            title: `${subtask} — ${goal.title}`,
            description: `Break down your ${goal.type} goal "${goal.title}" into smaller ${childType} tasks.`,
            reason: `Sub-task of "${goal.title}"`,
            suggestedType: childType,
            suggestedPriority: goal.priority,
            suggestedTags: [...(goal.tags || []), keyword],
            category: "breakdown",
          });
        }
        break; // Only match first keyword
      }
    }
  }

  return suggestions;
}

/**
 * Suggest related tasks based on shared tags
 */
function suggestRelatedTasks(todos: ITodo[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const tagTodos: Record<string, ITodo[]> = {};

  for (const todo of todos) {
    for (const tag of todo.tags || []) {
      if (!tagTodos[tag]) tagTodos[tag] = [];
      tagTodos[tag].push(todo);
    }
  }

  // If a tag has many active todos, suggest a review/planning task
  for (const [tag, taggedTodos] of Object.entries(tagTodos)) {
    const active = taggedTodos.filter((t) => t.status !== "completed");
    if (active.length >= 3) {
      suggestions.push({
        id: generateId(),
        title: `Review & prioritize "${tag}" tasks`,
        description: `You have ${active.length} active tasks tagged "${tag}". Consider reviewing and prioritizing them.`,
        reason: `${active.length} active tasks with tag "${tag}"`,
        suggestedType: "weekly",
        suggestedPriority: "medium",
        suggestedTags: [tag, "review"],
        category: "related",
      });
    }
  }

  return suggestions;
}

/**
 * Suggest rescheduling overdue incomplete todos
 */
function suggestCarryover(todos: ITodo[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = new Date();

  const overdue = todos.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate) < now
  );

  for (const todo of overdue.slice(0, 5)) {
    // Limit to 5
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    suggestions.push({
      id: generateId(),
      title: todo.title,
      description: `This task was due ${new Date(todo.dueDate).toLocaleDateString()} and is still incomplete. Reschedule it?`,
      reason: "Overdue — carry forward",
      suggestedType: "daily",
      suggestedPriority: "high",
      suggestedTags: [...(todo.tags || []), "carryover"],
      category: "carryover",
    });
  }

  return suggestions;
}

export function generateSuggestions(todos: ITodo[]): Suggestion[] {
  const all: Suggestion[] = [
    ...suggestCarryover(todos),
    ...detectRecurringPatterns(todos),
    ...suggestBreakdowns(todos),
    ...suggestRelatedTasks(todos),
  ];

  // Deduplicate by title
  const seen = new Set<string>();
  return all.filter((s) => {
    const key = s.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
