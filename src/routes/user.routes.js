import { Router } from "express";
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser, loginUser } from '../controllers/user.controller.js';
import { verifyToken } from "../middlewares/auth.middleware.js";
import { pool } from "../config/db.config.js";
import { ApiError } from "../utils/ApiError.js";


const router = Router()


router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.get('/profile',verifyToken, asyncHandler(async (req, res) => {
    const { id } = req.user
    const result  = await pool.query(`SELECT id, username, email FROM users WHERE id=$1`, [id])

    if(result.rows.length == 0){
        return res.status(404).json(new ApiError(404, "User Not Found"))
    }

    const user = result.rows[0]
    res.status(200).json({
        success : true,
        message : "User profile fetched successfully",
        user
    })
}))


export default router