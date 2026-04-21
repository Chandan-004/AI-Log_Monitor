import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import logRouter from "./routes/log.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/logs", logRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;
