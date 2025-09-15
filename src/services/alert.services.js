import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendAlert(log) {
  console.log("🚨 ALERT TRIGGERED");
  console.log(`Level: ${log.level}`);
  console.log(`Message: ${log.message}`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,  // use TLS (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Compose email
  const mailOptions = {
    from: `"Log Monitor" <${process.env.SMTP_USER}>`,
    to: process.env.ALERT_EMAIL_TO,
    subject: `🚨 Critical Log Alert: ${log.level}`,
    text: `A critical log was generated:\n\nLevel: ${log.level}\nMessage: ${log.message}\nSource: ${log.source}\nMetadata: ${JSON.stringify(log.metadata)}`,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Alert email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send alert email:", error);
  }
}
