import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface ITweet extends Document {
  tweet: string;
  user: Schema.Types.ObjectId;
}

const TweetSchema: Schema = new Schema({
  tweet: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true }
});

export const Tweet = mongoose.model<ITweet>("Tweet", TweetSchema);
