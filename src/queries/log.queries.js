import { pool } from '../config/db.config.js';

export const createLog = async ({ message, level, source, metadata }) => {
  const result = await pool.query(
    `INSERT INTO logs (message, level, source, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *;`,
    [message, level, source, metadata]
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

export const updateLog = async (id, { metadata }) => {
  const result = await pool.query(
    `UPDATE logs
     SET metadata = $1
     WHERE id = $2
     RETURNING *;`,
    [metadata, id]
  );
  return result.rows[0];
};

export const deleteLog = async (id) => {
  const result = await pool.query(`DELETE FROM logs WHERE id = $1;`, [id]);
  return { success: result.rowCount > 0 };
};
