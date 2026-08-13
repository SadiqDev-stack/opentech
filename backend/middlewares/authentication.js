import User from "../models/user.js";
import { compareHashes } from "../utilities/general.js";
import { log } from "./logger.js";

export default async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if email match
    const user = await User.findOne({
      email,
    });

    if (!user || user == null || user == undefined) {
      res.json({
        message: "User With This Email Doesnt Exist",
        found: false,
      });

      log("user with email doesnt exist", "bad");
      return;
    }

    const isCorrectPassword = await compareHashes(password, user.password);
    if (!isCorrectPassword)
      return res.json({
        message: "Incorrect Password",
        found: false,
      });

    req.user = user;

    next();
    // reset on login
    await User.findByIdAndUpdate(user._id, {
      loginFailAttempt: 0,
      lastLogin: new Date(),
    });
  } catch (er) {
    log(er, "bad");
    res.status(400).json({
      message: "unexpected error occurred",
    });
  }
};
