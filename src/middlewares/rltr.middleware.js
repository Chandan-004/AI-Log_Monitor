import rateLimit from "express-rate-limit";

export const logrltr = rateLimit({
  windowMs: 60 * 1000,
  max: 10, 
  message: "Too many logs created try again later"
});
