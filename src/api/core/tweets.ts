import * as express from "express";
import moment from "moment";
import { isUndefined } from "util";
import { Tweet } from "../../models/Tweet";
import { IUser, User } from "../../models/User";

export class Tweets {
  public routes(app: express.Application): void {
    app
      .route("/api/tweets/maxretweets")
      .get((req: express.Request, res: express.Response) => {
        let startDate = req.body.start;
        let endDate = req.body.end;

        if (
          !this.isDateWithinRange(startDate) ||
          !this.isDateWithinRange(endDate)
        ) {
          return res.status(400).json("Invalid date or date not within range");
        }

        startDate = moment(startDate, "YYYY-MM-DD hh:mm:ss")
          .utc()
          .toDate();
        endDate = moment(endDate, "YYYY-MM-DD hh:mm:ss")
          .utc()
          .toDate();

        // tslint:disable-next-line:no-console
        Tweet.aggregate(
          [
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
          ],
          async (err: any, result: any) => {
            const maxRetweetsArray: any = [];
            for (const r of result) {
              await User.findOne({ _id: r._id }).then((user: IUser) => {
                const username = user.name;
                const totalRetweets = r.total_retweets;
                maxRetweetsArray.push({ username, totalRetweets });
              });
            }
            maxRetweetsArray.sort((a: any, b: any) => {
              return a[1] - b[1];
            });
            return res.status(200).json(maxRetweetsArray);
          }
        );
      });
  }

  private isDateWithinRange(date: string): boolean {
    const d = moment(date, "YYYY-MM-DD hh:mm:ss").utc();
    return d.isValid() && d.isBetween("2018-12-31", "2019-05-01");
  }
}
