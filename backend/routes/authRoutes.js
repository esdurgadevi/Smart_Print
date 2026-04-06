import express from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  refreshToken,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
  changePassword,
  logoutUser,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* 🔹 PUBLIC ROUTES */
router.get("/get-data",(req,res)=>{
  res.status(200).json({message:"Correct"});
})
// Register → send OTP
router.post("/register", registerUser);

// Verify OTP (registration)
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", loginUser);

// Refresh token
router.post("/refresh-token", refreshToken);

// Forgot password → send OTP
router.post("/forgot-password", forgotPassword);

// Verify OTP (forgot password)
router.post("/verify-forgot-otp", verifyForgotOTP);

// Reset password
router.post("/reset-password", resetPassword);

/* 🔹 PROTECTED ROUTES */

// Change password (requires login)
router.post("/change-password", protect, changePassword);

// Logout
router.post("/logout", protect, logoutUser);

export default router;