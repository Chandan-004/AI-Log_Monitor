import { ApiError } from "../utils/ApiError.js";

export const validateLog = (req, res, next) => {
  const { message, level, metadata } = req.body;

  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Message is required and must be a string");
  }

  const allowedLevels = ["info", "warning", "error", "critical"];
  if (level && !allowedLevels.includes(level)) {
    throw new ApiError(400, `Invalid log level. Allowed: ${allowedLevels.join(", ")}`);
  }

  // Add all expected fields here
  const allowedKeys = ["message", "level", "metadata", "userId", "source"];
  const extraKeys = Object.keys(req.body).filter((key) => !allowedKeys.includes(key));
  if (extraKeys.length > 0) {
    throw new ApiError(400, `Unknown fields: ${extraKeys.join(", ")}`);
  }

  next();
};
