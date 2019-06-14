"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Tweet_1 = require("../../models/Tweet");
const User_1 = require("../../models/User");
class Tweets {
    routes(app) {
        app
            .route("/api/tweets/maxretweets")
            .get((req, res) => {
            let startDate = req.body.start;
            let endDate = req.body.end;
            if (!this.isDateWithinRange(startDate) ||
                !this.isDateWithinRange(endDate)) {
                return res.status(400).json("Invalid date or date not within range");
            }
            startDate = moment_1.default(startDate, "YYYY-MM-DD hh:mm:ss")
                .utc()
                .toDate();
            endDate = moment_1.default(endDate, "YYYY-MM-DD hh:mm:ss")
                .utc()
                .toDate();
            // tslint:disable-next-line:no-console
            Tweet_1.Tweet.aggregate([
                {
                    $match: {
                        created_at: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        total_retweets: {
                            $sum: "$retweet_count"
                        }
                    }
                }
            ], (err, result) => __awaiter(this, void 0, void 0, function* () {
                const maxRetweetsArray = [];
                for (const r of result) {
                    yield User_1.User.findOne({ _id: r._id }).then((user) => {
                        const username = user.name;
                        const totalRetweets = r.total_retweets;
                        maxRetweetsArray.push({ username, totalRetweets });
                    });
                }
                maxRetweetsArray.sort((a, b) => {
                    return a[1] - b[1];
                });
                return res.status(200).json(maxRetweetsArray);
            }));
        });
    }
    isDateWithinRange(date) {
        const d = moment_1.default(date, "YYYY-MM-DD hh:mm:ss").utc();
        return d.isValid() && d.isBetween("2018-12-31", "2019-05-01");
    }
}
exports.Tweets = Tweets;
//# sourceMappingURL=tweets.js.map