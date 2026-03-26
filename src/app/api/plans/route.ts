import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plan from "@/lib/models/Plan";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (type) filter.type = type;

  const plans = await Plan.find(filter)
    .populate("todos")
    .sort({ startDate: -1 });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();
  const plan = await Plan.create(body);
  return NextResponse.json(plan, { status: 201 });
}
