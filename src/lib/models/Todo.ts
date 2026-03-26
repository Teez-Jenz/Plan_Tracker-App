import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: Date;
  completedAt: Date | null;
  tags: string[];
  recurring: boolean;
  recurringPattern: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    recurring: { type: Boolean, default: false },
    recurringPattern: { type: String, default: null },
  },
  { timestamps: true }
);

TodoSchema.index({ type: 1, status: 1 });
TodoSchema.index({ dueDate: 1 });
TodoSchema.index({ tags: 1 });

const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);

export default Todo;
