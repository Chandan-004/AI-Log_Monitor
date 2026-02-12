import dotenv from 'dotenv'
import { DB_CONFIG } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import pkg from 'pg';
const { Pool } = pkg;



const pool = new Pool(DB_CONFIG);

const connectDB = async () => {
    try {
        console.log("Attempting to connect to database...");
        if (DB_CONFIG.connectionString) {
            const maskedUrl = DB_CONFIG.connectionString.replace(/:[^:@]+@/, ':***@');
            console.log(`Using connection string: ${maskedUrl}`);
        } else {
            console.log(`Using config: host=${DB_CONFIG.host}, user=${DB_CONFIG.user}, db=${DB_CONFIG.database}`);
        }

        await pool.query('SELECT NOW()');
        console.log(' PostgreSQL connected');
    } catch (err) {
        console.error("Database Connection Error:", err);
        throw new ApiError(500, `Database Connection failed: ${err.message}`);
    }
};

export { pool, connectDB };
