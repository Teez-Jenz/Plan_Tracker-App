import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/lib/models/Todo";
import ConsistencyLog from "@/lib/models/ConsistencyLog";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();

  // If marking as completed, set completedAt and update consistency
  if (body.status === "completed") {
    body.completedAt = new Date();

    const todo = await Todo.findById(id);
    if (todo && todo.status !== "completed") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await ConsistencyLog.findOneAndUpdate(
        { date: today, type: todo.type },
        { $inc: { completedCount: 1 } },
        { upsert: true }
      );
    }
  }

  // If un-completing, clear completedAt
  if (body.status && body.status !== "completed") {
    body.completedAt = null;
  }

  const todo = await Todo.findByIdAndUpdate(id, body, { new: true });
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json(todo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const todo = await Todo.findByIdAndDelete(id);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Todo deleted" });
}
