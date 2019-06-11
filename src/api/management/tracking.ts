import axios from "axios";
import * as express from "express";
import * as connect from "../services/connect";

import { IUser, User } from "../../models/User";

export class Tracking {
  public routes(app: express.Application): void {
    app
      .route("/api/user/add")
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
                  return res.status(400).json("Username already exists");
                } else {
                  user = new User({ name: handle });
                  user
                    .save()
                    .then((result) => {
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
      });
  }

  public async checkVerifiedUser(handle: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const params = { screen_name: handle };

      // Check if the user is a verified user.
      connect.client.get("users/show", params, (error, tweets, response) => {
        if (!error) {
          // tslint:disable-next-line:no-console
          // console.log(tweets.verified === true ? true : false);
          resolve(tweets.verified === true ? true : false);
        } else {
          resolve(false);
        }
      });
    });
  }
}
