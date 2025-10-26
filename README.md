# AI-Powered Log Monitoring & Alerting System

A system to monitor, classify, and alert on application logs in real-time using AI. Built with Node.js, Express, PostgreSQL, and OpenAI API, it helps teams quickly identify critical issues and take action before they escalate.

---

## Features

- Real-time log management (CRUD operations)  
- AI-powered log classification (Info, Warning, Critical)  
- User management and access control  
- Email/SMS notifications for critical logs  
- Secure endpoints with JWT authentication  
- Designed for scalability and production readiness  

---

## Tech Stack

Node.js | Express | PostgreSQL | OpenAI API | SMTP Notifications

---

## Project Structure 
The complete project structure is available in [PROJECT_STRUCTURE](./projStructure.txt).

----

## Project Data Flow Diagram 
The complete project dfd is available in [PROJECT_DFD](./dfd.png).

---

## Future Enhancements

- Automatically delete log table data after 30 days  
- Deploy on Render, Vercel, or AWS  
- Optional frontend dashboard for visualization and analytics  
- Advanced alerting rules based on log patterns  

---

## Why This Project Stands Out

- Integrates AI for intelligent log categorization  
- Real-time alerting for critical issues   
- Useful for monitoring any application or microservice logs  

---

## Project Setup and Installation

Follow these steps to get the project running locally.PrerequisitesNode.js (v18+)PostgreSQLAn OpenAI API KeySMTP credentials for email/SMS notificationsInstallationClone the Repository:Bashgit clone [Repo Link](https://github.com/Chandan-004/AI-Log_Monitor.git)

cd ai-log-monitor
Install Dependencies:Bashnpm install
Configure Environment Variables:Create a file named .env in the root directory and add the following configuration variables:Code snippet# Server & Auth
PORT=3000
JWT_SECRET=your_strong_jwt_secret

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ai_log_db

# AI Service
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SMTP for Notifications
SMTP_HOST=smtp.example.com
SMTP_USER=alert@example.com
SMTP_PASS=smtp_password
ADMIN_EMAIL=admin@yourcompany.com
Database Setup and Migration:Create your PostgreSQL database (ai_log_db) and run any necessary migrations (assuming you use a tool like Sequelize or Knex):Bash# Example command to run database migrations
npx [DB_MIGRATION_CLI] migrate
Running the SystemStart the application server:Bashnpm start
# or npm run dev (if using nodemon)
💻 Usage: Submitting a LogThe primary function is to accept and process raw log data via the API. Once authenticated (using a JWT in the header), send a log using a simple POST request:EndpointMethodDescription/api/logsPOSTSubmits a raw log for AI classification and storage.Example using cURL:Bashcurl -X POST http://localhost:3000/api/logs \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
-d '{
    "service": "checkout_service",
    "message": "Error processing payment for user 1234. Timeout occurred while contacting external gateway."
}'
Result: The system will classify this log as Critical, save it to PostgreSQL, and send an email alert to the ADMIN_EMAIL.

---

## Author

Chandan Mishra
