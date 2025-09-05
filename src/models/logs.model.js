import { pool } from '../config/db.config.js';
import { ApiError } from '../utils/ApiError.js';


export async function createLogsTable() {
  try {
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id BIGSERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level VARCHAR(20) NOT NULL CHECK (level IN ('info','warning','error','critical')),
        source VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','classified','critical','resolved')),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_logs_updated_at ON logs;
      CREATE TRIGGER trg_logs_updated_at
      BEFORE UPDATE ON logs
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

    console.log(" Logs table ready!");
  } catch (err) {
        throw new ApiError(500, "Failed to create logs table");
    }
}
