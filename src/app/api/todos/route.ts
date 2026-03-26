import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/lib/models/Todo";
import ConsistencyLog from "@/lib/models/ConsistencyLog";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const todos = await Todo.find(filter).sort({ dueDate: 1, priority: -1 });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();
  const todo = await Todo.create(body);

  // Update consistency log
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await ConsistencyLog.findOneAndUpdate(
    { date: today, type: body.type },
    { $inc: { totalCount: 1 } },
    { upsert: true }
  );

  return NextResponse.json(todo, { status: 201 });
}
