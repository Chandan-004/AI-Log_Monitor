import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { logrltr } from "../middlewares/rltr.middleware.js";
import { validateLog } from "../middlewares/logs.middleware.js";
import { 
  createLog,
  getLogs,
  updateLog,
  deleteLog
} from "../controllers/log.controller.js";

const router = express.Router();


router.post("/", verifyToken, logrltr, validateLog, createLog);
router.get("/", verifyToken, getLogs);
router.patch("/:id", verifyToken, updateLog);
router.delete("/:id", verifyToken, deleteLog);

export default router;
