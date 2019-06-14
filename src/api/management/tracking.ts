import * as express from "express";
import moment from "moment";
import * as connect from "../services/connect";

import { isUndefined } from "util";
import { ITweet, Tweet } from "../../models/Tweet";
import { IUser, User } from "../../models/User";

export class Tracking {
  public routes(app: express.Application): void {
    /**
     * Add a verified user to database.
     *
     */

    app
      .route("/api/users/add")
      .post(async (req: express.Request, res: express.Response) => {
        const handle: string = req.body.handle;
        this.checkVerifiedUser(handle)
          .then((response) => {
            if (response === false) {
              return res
                .status(400)
                .json("Invalid username or unverified user.");
            } else {
              User.findOne({ name: handle }).then((user: IUser) => {
                if (user) {
                  // If this is a valid username but it already exists.
                  return res.status(400).json("Username already exists");
                } else {
                  user = new User({ name: handle });
                  user
                    .save()
                    .then((result) => {
                      this.fetchTweets(handle);
                      return res
                        .status(200)
                        .json("User " + handle + " created.");
                    })
                    .catch((error: any) => {
                      return res.status(500).json("Internal server error");
                    });
                }
              });
            }
          })
          .catch((error) => {
            return res.status(400).json("Some error occured.");
          });
      });

    /**
     * Return list of all verified users.
     *
     */

    app
      .route("/api/users/show")
      .get((req: express.Request, res: express.Response) => {
        User.find({})
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

    app.route("/test").get((req: express.Request, res: express.Response) => {
      Tweet.collection.remove({});
      User.collection.remove({});
    });
  }

  /**
   * Check if a user is verified with the help of twitter API.
   *
   */
  public async checkVerifiedUser(handle: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const params = { screen_name: handle };

      // Check if the user is a verified user.
      connect.client.get("users/show", params, (error, tweets, response) => {
        if (!error) {
          resolve(tweets.verified === true ? true : false);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Fetches tweets of a user between 01/01/2019 to 30/04/2019
   *
   */
  private async fetchTweets(handle: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let params: any = {
        count: 200,
        screen_name: handle
      };
      const tweetText: string[] = [];
      const retweetCount: number[] = [];
      const createdAt: moment.Moment[] = [];

      while (true) {
        const tempTweetData: any = await this.getTweets(params);
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

      User.findOne({ name: handle }).then((user) => {
        for (const index in tweetText) {
          if (tweetText.hasOwnProperty(index)) {
            const tweet = new Tweet({
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
    });
  }

  /**
   * Find the approachability of a user.
   *
   */
  private findUserApproachability(handle: string): void {
    User.findOne({ name: handle }).then(async (user: IUser) => {
      await Tweet.find({ user: user.id }).then(async (tweets: ITweet[]) => {
        await this.findUnverifiedUsers(tweets).then((result: number[]) => {
          const frequency = result[0] / result[1];
          user.approachability = frequency;
          user.save();
          // tslint:disable-next-line:no-console
          console.log("Saved approachability for user " + handle);
        });
      });
    });
  }

  /**
   * Helper function to find tweets with mentions of unverified users and tweets with any mentions.
   *
   */
  private async findUnverifiedUsers(tweets: ITweet[]): Promise<number[]> {
    return new Promise<number[]>(async (resolve, reject) => {
      let count = 0;
      let totalCount = 0;
      for (const tweet of tweets) {
        const tweetTextArray = tweet.tweet.split(" ");
        let tempCount = 0;
        let tempTotalCount = 0;
        for (const tweetWord of tweetTextArray) {
          if (tweetWord[0] === "@") {
            ++tempTotalCount;
            await this.checkVerifiedUser(tweetWord).then(
              (response: boolean) => {
                if (response === false) {
                  ++tempCount;
                }
              }
            );
          }
        }
        count += tempCount > 0 ? 1 : 0;
        totalCount += tempTotalCount > 0 ? 1 : 0;
      }
      resolve([count, totalCount]);
    });
  }

  /**
   * Helper function to fetch tweets of a user from twitter API.
   *
   */
  private getTweets(params: any): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const startingDate = moment("2019-01-01").utc();
      const endingDate = moment("2019-04-30").utc();
      const tweetText: string[] = [];
      const retweetCount: number[] = [];
      const createdAt: moment.Moment[] = [];
      let maxId: number = 0;
      let flag: number = 0;

      connect.client.get(
        "statuses/user_timeline",
        params,
        (error, tweets, response) => {
          for (const tweet in tweets) {
            if (
              tweets.hasOwnProperty(tweet) &&
              !isUndefined(tweets[tweet].created_at)
            ) {
              const tweetCreationDate: moment.Moment = this.formatDate(
                tweets[tweet].created_at
              );

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
        }
      );
    });
  }

  /**
   * Helper function to format date (received from tweet object) into standard format.
   *
   */
  private formatDate(date: string): moment.Moment {
    const d = date.split(" ");
    return moment(
      d[5] + "-" + this.month(d[1]) + "-" + d[2] + "T" + d[3] + d[4]
    ).utc();
  }

  /**
   * Helper function to convert month name to month ID.
   *
   */
  private month(monthName: string): string {
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
    let mIndex: string = (months.indexOf(monthName) + 1).toString();
    if (mIndex.length < 2) {
      mIndex = "0" + mIndex;
    }
    return mIndex;
  }
}
