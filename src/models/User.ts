import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  approachability: number;
}

const UserSchema: Schema = new Schema({
  approachability: { type: Number, required: false, default: 0 },
  name: { type: String, required: true }
});

export const User = mongoose.model<IUser>("User", UserSchema);
