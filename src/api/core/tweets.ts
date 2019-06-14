import * as express from "express";
import moment from "moment";
import { isUndefined } from "util";
import { Tweet } from "../../models/Tweet";
import { User } from "../../models/User";

export class Tweets {
  public routes(app: express.Application): void {
    app
      .route("/api/tweets/maxretweets")
      .get((req: express.Request, res: express.Response) => {
        const startDate = req.body.start;
        const endDate = req.body.end;

        if (
          !this.isDateWithinRange(startDate) ||
          !this.isDateWithinRange(endDate)
        ) {
          return res.status(400).json("Invalid date or date not within range");
        }
      });
  }

  private isDateWithinRange(date: string): boolean {
    const d = moment(date, "YYYY-MM-DD hh:mm:ss");
    return d.isValid() && d.isBetween("2019-01-01", "2019-04-30");
  }
}
