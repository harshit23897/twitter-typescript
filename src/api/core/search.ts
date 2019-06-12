import * as express from "express";
import { isUndefined } from "util";
import { Tweet } from "../../models/Tweet";

export class Search {
  public routes(app: express.Application): void {
    app
      .route("/api/tweets/search")
      .get((req: express.Request, res: express.Response) => {
        Tweet.collection.getIndexes().then((result: any) => {
          if (isUndefined(result.tweet_text)) {
            // tslint:disable-next-line:no-console
            console.log("HELLO");
            Tweet.collection.createIndex({ tweet: "text" });
          }
        });
      });
  }
}
