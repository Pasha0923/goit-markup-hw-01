import { isValidObjectId } from "mongoose";
import HttpError from "./HttpError.js";

// мідлвара для валідації id
const isValidid = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    next(HttpError(400, `${id} is not valid id`));
  }
  next();
};
export default isValidid;
