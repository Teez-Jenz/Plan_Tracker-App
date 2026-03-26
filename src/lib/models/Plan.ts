import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPlan extends Document {
  title: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  todos: Types.ObjectId[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    todos: [{ type: Schema.Types.ObjectId, ref: "Todo" }],
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

PlanSchema.index({ type: 1 });
PlanSchema.index({ startDate: 1, endDate: 1 });

const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;
