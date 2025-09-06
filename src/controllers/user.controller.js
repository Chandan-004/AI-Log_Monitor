import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../config/db.config.js';
import { asyncHandler } from '../utils/asyncHandler.js';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;


const registerUser = async (req, res) => {
    console.log("BODY RECEIVED:", req.body);
    const { username, email, password } = req.body;

    const existing = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
        return res.status(400).json(new ApiResponse(400, null, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, hashedPassword]
    );

    res.status(201).json({ user: result.rows[0] });
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json(new ApiResponse(400, null, "User Not Found"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json(new ApiResponse(400, null, "Incorrect Password"));

    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.json({ accessToken, refreshToken });
};


const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "No refresh token provided"));
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json(new ApiResponse(403, null, "Invalid or expired refresh token"));
      }

      const newAccessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
      );

      return res
        .status(200)
        .json(new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed successfully"));
    }
  );
});

export { registerUser, loginUser , refreshAccessToken};

