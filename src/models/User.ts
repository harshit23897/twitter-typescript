import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true }
});

export const User = mongoose.model<IUser>("User", UserSchema);
