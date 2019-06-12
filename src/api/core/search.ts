import * as express from "express";
import { isUndefined } from "util";
import { Tweet } from "../../models/Tweet";
import { User } from "../../models/User";

export class Search {
  public routes(app: express.Application): void {
    app
      .route("/api/tweets/search")
      .get((req: express.Request, res: express.Response) => {
        const query = req.body.query;
        Tweet.find({ $text: { $search: query } }).then(result => {
          const tweets: string[] = [];
          for (const row of result) {
            tweets.push(row.tweet);
          }
          return res.status(200).json(tweets);
        });
      });

    app
      .route("/api/tweets/search/:user_id")
      .get((req: express.Request, res: express.Response) => {
        const userId = req.params.user_id;
        const query = req.body.query;
        User.findOne({ name: userId }).then(user => {
          if (!user) {
            return res.status(400).json("Username doesn't exist");
          }
          Tweet.find({ $text: { $search: query }, user: user.id }).then(
            result => {
              const tweets: string[] = [];
              for (const row of result) {
                tweets.push(row.tweet);
              }
              return res.status(200).json(tweets);
            }
          );
        });
      });
  }
}
