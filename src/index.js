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

app.get("/", (req, res) => {
  res.send(`
    <h1> AI Log Monitoring & Alerting System — Backend Running</h1>
    <p>This project doesn't have a UI here. You can test it using Postman or REST APIs.</p>
    <hr />
    <p>Available endpoints:</p>
    <ul>
      <li>POST /api/v1/users/register</li>
      <li>POST /api/v1/users/login</li>
      <li>GET  /api/v1/users/profile</li>
      <br />
      <li>POST /api/v1/logs</li>
      <li>GET  /api/v1/logs</li>
      <li>PATCH /api/v1/logs/:id</li>
      <li>DELETE /api/v1/logs/:id</li>
    </ul>
    <p>📌 Tip: Use the Authorization Bearer Token for protected routes.</p>
  `);
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/logs', logsRouter)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
