import * as express from "express";
import moment from "moment";
import { isUndefined } from "util";
import { ITweet, Tweet } from "../../models/Tweet";
import { IUser, User } from "../../models/User";
import { Tracking } from "../management/tracking";

export class Tweets {
  private tracking: Tracking = new Tracking();
  public routes(app: express.Application): void {
    /**
     * Find users with maximum retweets of all tweets posted within range.
     *
     */
    app
      .route("/api/users/maxretweets")
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

    /**
     * Find users who are more approachable.
     *
     */
    app
      .route("/api/users/approachable")
      .get((req: express.Request, res: express.Response) => {
        User.find({})
          .sort({ approachability: -1 })
          .then(async (users: IUser[]) => {
            const output: string[] = [];
            for (let index = 0; index < users.length; ++index) {
              if (index < 5) {
                output.push(users[index].name);
              } else {
                break;
              }
            }
            return res.status(200).json(output);
          });
      });
  }

  /**
   * Check if the date is a valid date and whether it is within range of 01/01/2019 to 30/04/2019
   *
   */
  private isDateWithinRange(date: string): boolean {
    const d = moment(date, "YYYY-MM-DD hh:mm:ss").utc();
    return d.isValid() && d.isBetween("2018-12-31", "2019-05-01");
  }
}
