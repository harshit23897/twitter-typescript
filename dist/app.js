"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser")); // used to parse the form data that you pass in the request
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const search_1 = require("./api/core/search");
const tracking_1 = require("./api/management/tracking");
class App {
    constructor() {
        this.tracking = new tracking_1.Tracking();
        this.search = new search_1.Search();
        this.app = express_1.default(); // run the express instance and store in app
        this.config();
        this.tracking.routes(this.app);
        this.search.routes(this.app);
        this.setupDb();
    }
    setupDb() {
        mongoose_1.default
            .connect("mongodb://mongo:27017/twitterdb")
            .then(() => {
            // tslint:disable-next-line:no-console
            console.log("Mongodb connected.");
        })
            .catch((error) => {
            // tslint:disable-next-line:no-console
            console.log(error);
            // tslint:disable-next-line:no-console
            console.log("Error in connecting to database");
        });
    }
    config() {
        // support application/json type post data
        this.app.use(bodyParser.json());
        // support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map