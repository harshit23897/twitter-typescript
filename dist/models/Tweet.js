"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const TweetSchema = new mongoose_2.Schema({
    created_at: { type: Date, required: true },
    retweet_count: { type: Number, required: true },
    tweet: { type: String, required: true },
    user: { type: mongoose_2.Schema.Types.ObjectId, required: true }
});
TweetSchema.index({ $text: { $tweet: "text" } });
exports.Tweet = mongoose_1.default.model("Tweet", TweetSchema);
//# sourceMappingURL=Tweet.js.map