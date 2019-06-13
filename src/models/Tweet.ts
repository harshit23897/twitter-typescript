import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface ITweet extends Document {
  created_at: Date;
  retweet_count: number;
  tweet: string;
  user: Schema.Types.ObjectId;
}

const TweetSchema: Schema = new Schema({
  created_at: { type: Date, required: true },
  retweet_count: { type: Number, required: true },
  tweet: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true }
});

TweetSchema.index({ $text: { $tweet: "text" } });

export const Tweet = mongoose.model<ITweet>("Tweet", TweetSchema);
