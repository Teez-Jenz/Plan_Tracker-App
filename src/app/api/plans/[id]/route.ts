import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plan from "@/lib/models/Plan";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const body = await req.json();

  const plan = await Plan.findByIdAndUpdate(id, body, { new: true }).populate(
    "todos"
  );
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const plan = await Plan.findByIdAndDelete(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Plan deleted" });
}
