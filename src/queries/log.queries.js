import { pool } from '../config/db.config.js';

export const createLog = async ({ userId, message, level, source, metadata }) => {
  const result = await pool.query(
    `INSERT INTO logs (user_id, message, level, source, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [userId, message, level, source, metadata]
  );
  return result.rows[0];
};

export const getLogs = async ({ level, source, limit = 50, offset = 0 }) => {
  const filters = [];
  const values = [];
  let idx = 1;

  if (level) {
    filters.push(`level = $${idx++}`);
    values.push(level);
  }

  if (source) {
    filters.push(`source = $${idx++}`);
    values.push(source);
  }

  let query = `SELECT * FROM logs`;
  if (filters.length > 0) {
    query += ` WHERE ${filters.join(" AND ")}`;
  }
  query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`;

  const result = await pool.query(query, values);
  return result.rows;
};

export const updateLog = async (id, { metadata, category, severity, alert_triggered, status }) => {
  const result = await pool.query(
    `UPDATE logs
     SET metadata = COALESCE($1, metadata),
         category = COALESCE($2, category),
         severity = COALESCE($3, severity),
         alert_triggered = COALESCE($4, alert_triggered),
         status = COALESCE($5, status),
         updated_at = NOW()
     WHERE id = $6
     RETURNING *;`,
    [metadata, category, severity, alert_triggered, status, id]
  );
  return result.rows[0];
};

export const deleteLog = async (id) => {
  const result = await pool.query(`DELETE FROM logs WHERE id = $1;`, [id]);
  return { success: result.rowCount > 0 };
};
