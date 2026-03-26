import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsistencyLog extends Document {
  date: Date;
  type: "daily" | "weekly" | "monthly" | "yearly";
  completedCount: number;
  totalCount: number;
  createdAt: Date;
}

const ConsistencyLogSchema = new Schema<IConsistencyLog>(
  {
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    completedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ConsistencyLogSchema.index({ date: 1, type: 1 }, { unique: true });

const ConsistencyLog: Model<IConsistencyLog> =
  mongoose.models.ConsistencyLog ||
  mongoose.model<IConsistencyLog>("ConsistencyLog", ConsistencyLogSchema);

export default ConsistencyLog;
