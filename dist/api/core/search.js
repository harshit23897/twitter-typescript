"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tweet_1 = require("../../models/Tweet");
const User_1 = require("../../models/User");
class Search {
    routes(app) {
        app
            .route("/api/tweets/search")
            .get((req, res) => {
            const query = req.body.query;
            Tweet_1.Tweet.find({ $text: { $search: query } }).then((result) => {
                const tweets = [];
                for (const row of result) {
                    tweets.push(row.tweet);
                }
                return res.status(200).json(tweets);
            });
        });
        app
            .route("/api/tweets/search/:user_id")
            .get((req, res) => {
            const userId = req.params.user_id;
            const query = req.body.query;
            User_1.User.findOne({ name: userId }).then((user) => {
                if (!user) {
                    return res.status(400).json("Username doesn't exist");
                }
                Tweet_1.Tweet.find({ $text: { $search: query }, user: user.id }).then((result) => {
                    const tweets = [];
                    for (const row of result) {
                        tweets.push(row.tweet);
                    }
                    return res.status(200).json(tweets);
                });
            });
        });
    }
}
exports.Search = Search;
//# sourceMappingURL=search.js.map