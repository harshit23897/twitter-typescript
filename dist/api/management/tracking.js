"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect = __importStar(require("../services/connect"));
const Tweet_1 = require("../../models/Tweet");
const User_1 = require("../../models/User");
class Tracking {
    routes(app) {
        // Add a verified user to database.
        app
            .route("/api/users/add")
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            User_1.User.collection.remove({});
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
            const users = User_1.User.find({})
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
        app
            .route("/api/users/test")
            .get((req, res) => {
            const handle = req.body.handle;
            User_1.User.findOne({ name: handle }).then((user) => {
                Tweet_1.Tweet.find({ user: user.id }).then((tweets) => {
                    // tslint:disable-next-line:no-console
                    console.log(tweets);
                });
            });
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
                while (true) {
                    const tempTweetText = yield this.getTweets(params);
                    tweetText.push(...tempTweetText.tweetText);
                    params = {
                        count: 200,
                        max_id: tempTweetText.maxId,
                        screen_name: handle
                    };
                    if (tempTweetText.flag > 0) {
                        break;
                    }
                }
                User_1.User.findOne({ name: handle }).then((user) => {
                    for (const tText of tweetText) {
                        const tweet = new Tweet_1.Tweet({ user: user.id, tweet: tText });
                        tweet.save();
                    }
                });
            }));
        });
    }
    getTweets(params) {
        return new Promise((resolve, reject) => {
            const startingDate = new Date(2019, 0, 1);
            const endingDate = new Date(2019, 4, 31);
            const tweetText = [];
            let maxId = 0;
            let flag = 0;
            connect.client.get("statuses/user_timeline", params, (error, tweets, response) => {
                for (const tweet in tweets) {
                    if (tweets.hasOwnProperty(tweet)) {
                        const tweetCreationDate = this.findDate(tweets[tweet].created_at);
                        if (tweetCreationDate < startingDate) {
                            ++flag;
                            break;
                        }
                        if (tweetCreationDate < endingDate) {
                            maxId = tweets[tweet].id;
                            tweetText.push(tweets[tweet].text);
                        }
                    }
                }
                resolve({ maxId, tweetText, flag });
            });
        });
    }
    findDate(date) {
        const arr = date.split(" ");
        return new Date(parseInt(arr[5], 10), this.month(arr[1]), parseInt(arr[2], 10));
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
        return months.indexOf(monthName);
    }
}
exports.Tracking = Tracking;
//# sourceMappingURL=tracking.js.map