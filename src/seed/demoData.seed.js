import { pool } from "../config/db.config.js";
import { analyzeLog } from "../services/ai.services.js"; // Your rule-based AI

async function seedDemoData() {
  try {
    // -----------------------
    // 1️⃣ Create demo users
    // -----------------------
    for (const u of usersData) {
  const res = await pool.query(`
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO NOTHING
    RETURNING *;
  `, [u.username, u.email, u.password]);

  if (res.rows[0]) {
    users.push(res.rows[0]);
  } else {
    // If conflict, fetch existing user
    const existing = await pool.query(`SELECT * FROM users WHERE email=$1`, [u.email]);
    users.push(existing.rows[0]);
  }
}


    console.log("✅ Demo users created:", users.map(u => u.username).join(", "));

    // -----------------------
    // 2️⃣ Create demo logs
    // -----------------------
    const demoLogs = [
      { message: "Database connection timeout", level: "error", source: "DB" },
      { message: "Memory usage above 80%", level: "warning", source: "Server" },
      { message: "User login successful", level: "info", source: "Auth" },
      { message: "Critical disk failure detected!", level: "critical", source: "Disk" },
      { message: "CPU usage spiked to 95%", level: "warning", source: "Server" },
      { message: "Unauthorized access attempt", level: "error", source: "Auth" },
      { message: "Service restarted successfully", level: "info", source: "Server" },
      { message: "High latency detected on API", level: "warning", source: "API" },
      { message: "Critical memory leak detected!", level: "critical", source: "Server" },
      { message: "Backup completed successfully", level: "info", source: "DB" }
    ];

    for (const logData of demoLogs) {
      // Assign randomly to a user
      const user = users[Math.floor(Math.random() * users.length)];

      // Insert log
      const logRes = await pool.query(`
        INSERT INTO logs (user_id, message, level, source)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [user.id, logData.message, logData.level, logData.source]);

      const log = logRes.rows[0];

      // Run AI analysis (rule-based)
      const aiResult = await analyzeLog(log.message);

      // Update log with AI results
      await pool.query(`
        UPDATE logs
        SET category=$1, severity=$2, alert_triggered=$3
        WHERE id=$4;
      `, [aiResult.category, aiResult.severity, aiResult.severity >= 7, log.id]);

      console.log(`✅ Log seeded for ${user.username}: "${log.message}"`);
    }

    console.log("🎉 Demo data seeded successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error seeding demo data:", err);
    process.exit(1);
  }
}

seedDemoData();
