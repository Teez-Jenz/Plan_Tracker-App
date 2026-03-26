import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/lib/models/Todo";
import ConsistencyLog from "@/lib/models/ConsistencyLog";

export async function GET() {
  await dbConnect();

  // Overall counts by type
  const types = ["daily", "weekly", "monthly", "yearly"] as const;
  const completionByType: Record<string, { completed: number; total: number; rate: number }> = {};

  for (const type of types) {
    const total = await Todo.countDocuments({ type });
    const completed = await Todo.countDocuments({ type, status: "completed" });
    completionByType[type] = {
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // Current streak (consecutive days with at least 1 completion)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const checkDate = new Date(today);

  while (true) {
    const log = await ConsistencyLog.findOne({
      date: checkDate,
      type: "daily",
      completedCount: { $gt: 0 },
    });

    if (!log) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Last 90 days heatmap data
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const heatmapLogs = await ConsistencyLog.find({
    date: { $gte: ninetyDaysAgo },
    type: "daily",
  }).sort({ date: 1 });

  const heatmap = heatmapLogs.map((log) => ({
    date: log.date.toISOString().split("T")[0],
    completed: log.completedCount,
    total: log.totalCount,
  }));

  // Overdue count
  const overdue = await Todo.countDocuments({
    status: { $ne: "completed" },
    dueDate: { $lt: today },
  });

  // Today's progress
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const todayTotal = await Todo.countDocuments({
    type: "daily",
    dueDate: { $gte: today, $lte: todayEnd },
  });
  const todayCompleted = await Todo.countDocuments({
    type: "daily",
    status: "completed",
    dueDate: { $gte: today, $lte: todayEnd },
  });

  return NextResponse.json({
    completionByType,
    streak,
    heatmap,
    overdue,
    todayProgress: {
      completed: todayCompleted,
      total: todayTotal,
      rate: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
    },
  });
}
