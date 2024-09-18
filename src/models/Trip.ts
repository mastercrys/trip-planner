import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
  origin: string;
  destination: string;
  cost: number;
  duration: number;
  type: string;
  id: string;
  display_name: string;
  created_at: Date;
  updated_at: Date;
}

const TripSchema: Schema = new Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  cost: { type: Number, required: true },
  duration: { type: Number, required: true },
  type: { type: String, required: true },
  id: { type: String, required: true },
  display_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

TripSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<ITrip>("Trip", TripSchema);
