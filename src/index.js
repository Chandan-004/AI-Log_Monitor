import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { pool, connectDB } from "./config/db.config.js";
import { createUsersTable } from "./models/user.model.js";
import { createLogsTable } from "./models/logs.model.js";

connectDB()
createUsersTable()
createLogsTable()

import usersRouter from "./routes/user.routes.js"; 
import logsRouter from "./routes/log.routes.js"; 

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/logs', logsRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
