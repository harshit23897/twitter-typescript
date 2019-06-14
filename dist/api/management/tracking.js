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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const connect = __importStar(require("../services/connect"));
const util_1 = require("util");
const Tweet_1 = require("../../models/Tweet");
const User_1 = require("../../models/User");
class Tracking {
    routes(app) {
        // Add a verified user to database.
        app
            .route("/api/users/add")
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            const handle = req.body.handle;
            this.checkVerifiedUser(handle)
                .then((response) => {
                if (response === false) {
                    return res
                        .status(400)
                        .json("Invalid username or unverified user.");
                }
                else {
                    User_1.User.findOne({ name: handle }).then((user) => {
                        if (user) {
                            return res.status(400).json("Username already exists");
                        }
                        else {
                            user = new User_1.User({ name: handle });
                            user
                                .save()
                                .then((result) => {
                                this.fetchTweets(handle);
                                return res
                                    .status(200)
                                    .json("User " + handle + " created.");
                            })
                                .catch((error) => {
                                return res.status(500).json("Internal server error");
                            });
                        }
                    });
                }
            })
                .catch((error) => {
                return res.status(400).json("Some error occured.");
            });
        }));
        // Return list of all verified users.
        app
            .route("/api/users/show")
            .get((req, res) => {
            User_1.User.find({})
                .then((result) => {
                const names = [];
                for (const row in result) {
                    if (result.hasOwnProperty(row)) {
                        names.push(result[row].name);
                    }
                }
                return res.status(200).json(names);
            })
                .catch((error) => {
                return res.status(400).json("Some error occured");
            });
        });
        app.route("/test").get((req, res) => {
            Tweet_1.Tweet.collection.remove({});
            User_1.User.collection.remove({});
        });
    }
    checkVerifiedUser(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const params = { screen_name: handle };
                // Check if the user is a verified user.
                connect.client.get("users/show", params, (error, tweets, response) => {
                    if (!error) {
                        resolve(tweets.verified === true ? true : false);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }
    fetchTweets(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let params = {
                    count: 200,
                    screen_name: handle
                };
                const tweetText = [];
                const retweetCount = [];
                const createdAt = [];
                while (true) {
                    const tempTweetData = yield this.getTweets(params);
                    tweetText.push(...tempTweetData.tweetText);
                    retweetCount.push(...tempTweetData.retweetCount);
                    createdAt.push(...tempTweetData.createdAt);
                    params = {
                        count: 200,
                        max_id: tempTweetData.maxId,
                        screen_name: handle
                    };
                    if (tempTweetData.flag > 0) {
                        break;
                    }
                }
                User_1.User.findOne({ name: handle }).then((user) => {
                    for (const index in tweetText) {
                        if (tweetText.hasOwnProperty(index)) {
                            const tweet = new Tweet_1.Tweet({
                                created_at: createdAt[index].utc().toDate(),
                                retweet_count: retweetCount[index],
                                tweet: tweetText[index],
                                user: user.id
                            });
                            tweet.save();
                        }
                    }
                    // tslint:disable-next-line:no-console
                    console.log("Saved all tweets for user " + handle);
                    this.findUserApproachability(handle);
                });
            }));
        });
    }
    findUserApproachability(handle) {
        User_1.User.findOne({ name: handle }).then((user) => __awaiter(this, void 0, void 0, function* () {
            yield Tweet_1.Tweet.find({ user: user.id }).then((tweets) => __awaiter(this, void 0, void 0, function* () {
                yield this.findUnverifiedUsers(tweets).then((result) => {
                    const frequency = result / tweets.length;
                    user.approachability = frequency;
                    user.save();
                    // tslint:disable-next-line:no-console
                    console.log("Saved approachability for user " + handle);
                });
            }));
        }));
    }
    findUnverifiedUsers(tweets) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let count = 0;
                for (const tweet of tweets) {
                    const tweetTextArray = tweet.tweet.split(" ");
                    for (const tweetWord of tweetTextArray) {
                        if (tweetWord[0] === "@") {
                            yield this.checkVerifiedUser(tweetWord).then((response) => {
                                if (response === false) {
                                    ++count;
                                }
                            });
                        }
                    }
                }
                resolve(count);
            }));
        });
    }
    getTweets(params) {
        return new Promise((resolve, reject) => {
            const startingDate = moment_1.default("2019-01-01").utc();
            const endingDate = moment_1.default("2019-04-30").utc();
            const tweetText = [];
            const retweetCount = [];
            const createdAt = [];
            let maxId = 0;
            let flag = 0;
            connect.client.get("statuses/user_timeline", params, (error, tweets, response) => {
                for (const tweet in tweets) {
                    if (tweets.hasOwnProperty(tweet) &&
                        !util_1.isUndefined(tweets[tweet].created_at)) {
                        const tweetCreationDate = this.formatDate(tweets[tweet].created_at);
                        if (tweetCreationDate.isBefore(startingDate)) {
                            ++flag;
                            break;
                        }
                        if (tweetCreationDate.isBefore(endingDate)) {
                            maxId = tweets[tweet].id;
                            tweetText.push(tweets[tweet].text);
                            retweetCount.push(tweets[tweet].retweet_count);
                            createdAt.push(tweetCreationDate);
                        }
                    }
                }
                resolve({ maxId, tweetText, flag, retweetCount, createdAt });
            });
        });
    }
    formatDate(date) {
        const d = date.split(" ");
        return moment_1.default(d[5] + "-" + this.month(d[1]) + "-" + d[2] + "T" + d[3] + d[4]).utc();
    }
    month(monthName) {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];
        let mIndex = (months.indexOf(monthName) + 1).toString();
        if (mIndex.length < 2) {
            mIndex = "0" + mIndex;
        }
        return mIndex;
    }
}
exports.Tracking = Tracking;
//# sourceMappingURL=tracking.js.map