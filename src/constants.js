import dotenv from "dotenv";
dotenv.config();

export const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};
