import dotenv from "dotenv";
dotenv.config();

export const DB_CONFIG = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? {} : { ssl: { rejectUnauthorized: false } })
  }
  : {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
