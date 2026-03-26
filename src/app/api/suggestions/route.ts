import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/lib/models/Todo";
import { generateSuggestions } from "@/lib/suggestions";

export async function GET() {
  await dbConnect();

  const todos = await Todo.find({});
  const suggestions = generateSuggestions(todos);

  return NextResponse.json(suggestions);
}
