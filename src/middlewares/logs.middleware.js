import { ApiError } from "../utils/ApiError.js";

export const validateLog = (req, res, next) => {
  const { message, level, metadata } = req.body;

  
  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Message is required and must be a string");
  }

  
  const allowedLevels = ["info", "warn", "error", "debug"];
  if (level && !allowedLevels.includes(level)) {
    throw new ApiError(400, `Invalid log level. Allowed: ${allowedLevels.join(", ")}`);
  }

  
  const allowedKeys = ["message", "level", "metadata"];
  const extraKeys = Object.keys(req.body).filter((key) => !allowedKeys.includes(key));
  if (extraKeys.length > 0) {
    throw new ApiError(400, `Unknown fields: ${extraKeys.join(", ")}`);
  }

  next();
};
