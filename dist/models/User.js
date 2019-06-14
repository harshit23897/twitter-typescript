"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const UserSchema = new mongoose_2.Schema({
    approachability: { type: Number, required: false, default: 0 },
    name: { type: String, required: true }
});
exports.User = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=User.js.map