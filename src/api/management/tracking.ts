import axios from "axios";
import * as express from "express";
import * as connect from "../services/connect";

import { Stream } from "stream";
import { ITweet, Tweet } from "../../models/Tweet";
import { IUser, User } from "../../models/User";

export class Tracking {
  public routes(app: express.Application): void {
    // Add a verified user to database.
    app
      .route("/api/users/add")
      .post(async (req: express.Request, res: express.Response) => {
        User.collection.remove({});
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

    // Return list of all verified users.
    app
      .route("/api/users/show")
      .get((req: express.Request, res: express.Response) => {
        const users = User.find({})
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
      .get((req: express.Request, res: express.Response) => {
        const handle = req.body.handle;

        User.findOne({ name: handle }).then((user) => {
          Tweet.find({ user: user.id }).then((tweets) => {
            // tslint:disable-next-line:no-console
            console.log(tweets);
          });
        });
      });
  }

  private async checkVerifiedUser(handle: string): Promise<boolean> {
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

  private async fetchTweets(handle: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      let params: any = {
        count: 200,
        screen_name: handle
      };
      const tweetText: string[] = [];

      while (true) {
        const tempTweetText: any = await this.getTweets(params);
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

      User.findOne({ name: handle }).then((user) => {
        for (const tText of tweetText) {
          const tweet = new Tweet({ user: user.id, tweet: tText });
          tweet.save();
        }
      });
    });
  }

  private getTweets(params: object): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const startingDate = new Date(2019, 0, 1);
      const endingDate = new Date(2019, 4, 31);
      const tweetText: string[] = [];
      let maxId: number = 0;
      let flag: number = 0;

      connect.client.get(
        "statuses/user_timeline",
        params,
        (error, tweets, response) => {
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
        }
      );
    });
  }

  private findDate(date: string): Date {
    const arr = date.split(" ");
    return new Date(
      parseInt(arr[5], 10),
      this.month(arr[1]),
      parseInt(arr[2], 10)
    );
  }

  private month(monthName: string): number {
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
