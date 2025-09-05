import { pool } from '../config/db.config.js';
import { ApiError } from '../utils/ApiError.js';

export const createUsersTable = async () => {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log(' Users table created');
    } catch (err) {
        throw new ApiError(500, "Failed to create users table");
    }
};
