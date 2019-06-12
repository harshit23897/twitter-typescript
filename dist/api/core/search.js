"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const Tweet_1 = require("../../models/Tweet");
class Search {
    routes(app) {
        app
            .route("/api/tweets/search")
            .get((req, res) => {
            Tweet_1.Tweet.collection.getIndexes().then((result) => {
                if (util_1.isUndefined(result.tweet_text)) {
                    // tslint:disable-next-line:no-console
                    console.log("HELLO");
                    Tweet_1.Tweet.collection.createIndex({ tweet: "text" });
                }
            });
        });
    }
}
exports.Search = Search;
//# sourceMappingURL=search.js.map