import { adminConfigController } from "../controllers/admin/configController.js";
import { log } from "./logger.js";

export default async (req, res, next) => {
  try {
    await adminConfigController.getConfig(req, res, next);
  } catch (er) {
    log(`config loading error: ${er.message} ${er}`, "bad");
  }
};
