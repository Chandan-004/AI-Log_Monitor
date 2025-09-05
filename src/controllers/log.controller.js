import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as logQueries from "../queries/log.queries.js";
import { classifyLog } from "../services/ai.service.js";
import { sendAlert } from "../services/alert.service.js";


export const createLog = asyncHandler(async (req, res) => {
  const { message, level, source = null, metadata = {} } = req.body;

  if (!message || !level) {
    throw new ApiError(400, "Message and Level are required");
  }

  const allowedLevels = ["info", "warning", "error", "critical"];
  if (!allowedLevels.includes(level)) {
    throw new ApiError(400, "Invalid log level");
  }

  const log = await logQueries.createLog({ message, level, source, metadata });

  
  classifyLog(log).then(async (aiResult) => {
    await logQueries.updateLog(log.id, {
      status: aiResult.status,
      metadata: { ...log.metadata, ai: aiResult },
    });
    if (aiResult.status === "critical" || level === "critical") {
      await sendAlert(log);
    }
  }).catch(err => {
    console.error("AI hook failed:", err);
  });


  return res
    .status(201)
    .json(new ApiResponse(201, log, "Log created successfully"));
});


export const getLogs = asyncHandler(async (req, res) => {
  const { level, source, limit = 50, offset = 0 } = req.query;

  const logs = await logQueries.getLogs({
    level,
    source,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Logs fetched successfully"));
});


export const updateLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metadata, status } = req.body;
  if (!metadata && !status) {
    throw new ApiError(400, "Nothing to update");
  }


  const updatedLog = await logQueries.updateLog(id, { metadata });
  if (!updatedLog) {
    throw new ApiError(404, "Log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLog, "Log updated successfully"));
});


export const deleteLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await logQueries.deleteLog(id);
  if (!result.success) {
    throw new ApiError(404, "Log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Log deleted successfully"));
});
