import dotenv from 'dotenv'
import { DB_CONFIG } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import pkg from 'pg';
const { Pool } = pkg;



const pool = new Pool(DB_CONFIG);

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log(' PostgreSQL connected');
    } catch (err) {
        console.error("Database Connection Error:", err);
        throw new ApiError(500, `Database Connection failed: ${err.message}`);
    }
};

export { pool, connectDB };
