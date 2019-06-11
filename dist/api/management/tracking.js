"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect = __importStar(require("../services/connect"));
const User_1 = require("../../models/User");
class Tracking {
    routes(app) {
        app
            .route("/api/user/add")
            .post((req, res) => __awaiter(this, void 0, void 0, function* () {
            const handle = req.body.handle;
            this.checkVerifiedUser(handle)
                .then((response) => {
                if (response === false) {
                    return res
                        .status(400)
                        .json("Invalid username or unverified user.");
                }
                else {
                    User_1.User.findOne({ name: handle }).then((user) => {
                        if (user) {
                            return res.status(400).json("Username already exists");
                        }
                        else {
                            user = new User_1.User({ name: handle });
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
        }));
    }
    checkVerifiedUser(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const params = { screen_name: handle };
                // Check if the user is a verified user.
                connect.client.get("users/show", params, (error, tweets, response) => {
                    if (!error) {
                        // tslint:disable-next-line:no-console
                        // console.log(tweets.verified === true ? true : false);
                        resolve(tweets.verified === true ? true : false);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }
}
exports.Tracking = Tracking;
//# sourceMappingURL=tracking.js.map