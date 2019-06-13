"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class Tweets {
    routes(app) {
        app
            .route("/api/tweets/maxretweets")
            .get((req, res) => {
            const startDate = req.body.start;
            const endDate = req.body.end;
            if (!this.isDateWithinRange(startDate) ||
                !this.isDateWithinRange(endDate)) {
                return res.status(400).json("Invalid date or date not within range");
            }
            // Date format - Day/Month/Year Hours:Minutes:Seconds
        });
    }
    isDateWithinRange(date) {
        const d = moment_1.default(date);
        return d.isValid() && d.isAfter("2018-12-31") && d.isBefore("2019-05-01");
    }
}
exports.Tweets = Tweets;
//# sourceMappingURL=tweets.js.map