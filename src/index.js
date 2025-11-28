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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Log Monitoring & Alerting System</title>
    <style>
      body {
        margin: 0;
        font-family: "Poppins", sans-serif;
        background: linear-gradient(135deg, #1f1c2c, #928dab);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }
      .container {
        background: rgba(255, 255, 255, 0.09);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 35px 45px;
        max-width: 680px;
        width: 100%;
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
        animation: fadeIn 0.8s ease;
      }
      h1 {
        font-size: 32px;
        margin-bottom: 10px;
        text-align: center;
      }
      p {
        line-height: 1.6;
        font-size: 15px;
        text-align: center;
        margin-bottom: 18px;
      }
      hr {
        border: none;
        height: 1px;
        margin: 20px 0;
        background: rgba(255, 255, 255, 0.25);
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        background: rgba(255, 255, 255, 0.12);
        margin: 6px 0;
        padding: 10px 14px;
        border-radius: 8px;
        transition: 0.25s;
      }
      li:hover {
        background: rgba(255, 255, 255, 0.28);
        transform: translateX(4px);
      }
      .token {
        margin-top: 18px;
        font-size: 13px;
        opacity: 0.8;
        text-align: center;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🚀 AI Log Monitoring & Alerting System</h1>
      <p>
        Backend server is running successfully.<br/>
        Use Postman or any REST client to access APIs.
      </p>

      <hr />

      <ul>
        <li>POST /api/v1/users/register</li>
        <li>POST /api/v1/users/login</li>
        <li>GET  /api/v1/users/profile</li>
        <br/>
        <li>POST /api/v1/logs</li>
        <li>GET  /api/v1/logs</li>
        <li>PATCH /api/v1/logs/:id</li>
        <li>DELETE /api/v1/logs/:id</li>
      </ul>

      <p class="token">🔐 Note: Protected routes require Bearer Token</p>
    </div>
  </body>
  </html>
  `);
});


app.use('/api/v1/users', usersRouter);
app.use('/api/v1/logs', logsRouter)



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
