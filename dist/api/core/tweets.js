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
        });
    }
    isDateWithinRange(date) {
        const d = moment_1.default(date, "YYYY-MM-DD hh:mm:ss");
        return d.isValid() && d.isBetween("2019-01-01", "2019-04-30");
    }
}
exports.Tweets = Tweets;
//# sourceMappingURL=tweets.js.map