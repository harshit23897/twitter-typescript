import * as bodyParser from "body-parser"; // used to parse the form data that you pass in the request
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { Tracking } from "./api/management/tracking";

class App {
  public app: express.Application;
  public tracking: Tracking = new Tracking();

  constructor() {
    this.app = express(); // run the express instance and store in app
    this.config();
    this.tracking.routes(this.app);
    this.setupDb();
  }

  private setupDb(): void {
    mongoose
      .connect("mongodb://localhost/twitterdb")
      .then(() => {
        // tslint:disable-next-line:no-console
        console.log("Mongodb connected.");
      })
      .catch((error: any) => {
        // tslint:disable-next-line:no-console
        console.log("Error in connecting to database");
      });
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false
      })
    );
  }
}

export default new App().app;
