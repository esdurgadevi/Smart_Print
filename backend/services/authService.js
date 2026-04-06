import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

/* 🔹 TOKEN FUNCTIONS */
const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

/* 🔹 OTP GENERATOR */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* 🔹 EMAIL TRANSPORTER */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

/* 🔹 SEND OTP VIA EMAIL */
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Print Management",
      html: `
        <h2>Welcome to Print Management!</h2>
        <p>Your OTP is: <strong style="font-size: 24px; color: #ff6b35;">${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Failed to send OTP");
  }
};

/* ===================================================== */
/* 🔥 1. REGISTER (SEND OTP FIRST) */
export const registerUser = async (data) => {
  if (!data.name || !data.email || !data.password) {
    throw new Error("All fields required");
  }

  const existing = await User.findOne({ where: { email: data.email } });

  if (existing && existing.isVerified) {
    throw new Error("User already exists");
  }

  const otp = generateOTP();

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const validRole = data.role === "SHOP_ADMIN" ? "SHOP_ADMIN" : "USER";

  const user = await User.upsert({
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    password: hashedPassword,
    role: validRole,
    otp,
    otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    isVerified: false,
  });

  await sendOTP(data.email, otp);

  return { message: "OTP sent to email" };
};

/* ===================================================== */
/* 🔥 2. VERIFY OTP (COMPLETE REGISTRATION) */
export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");

  if (new Date() > user.otpExpiry)
    throw new Error("OTP expired");

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  return { message: "Registration successful" };
};

/* ===================================================== */
/* 🔥 3. LOGIN */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  if (!user.isVerified) {
    const error = new Error("Please verify your OTP first. Check your email for the OTP code.");
    error.code = "OTP_NOT_VERIFIED";
    throw error;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/* ===================================================== */
/* 🔥 4. FORGOT PASSWORD (SEND OTP) */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await user.save();

  await sendOTP(email, otp);

  return { message: "OTP sent for password reset" };
};

/* ===================================================== */
/* 🔥 5. VERIFY OTP FOR RESET */
export const verifyForgotOTP = async (email, otp) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  if (user.otp !== otp) throw new Error("Invalid OTP");

  if (new Date() > user.otpExpiry)
    throw new Error("OTP expired");

  return { message: "OTP verified" };
};

/* ===================================================== */
/* 🔥 6. RESET PASSWORD (AFTER OTP) */
export const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  return { message: "Password reset successful" };
};

/* ===================================================== */
/* 🔥 7. CHANGE PASSWORD (LOGGED IN USER) */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) throw new Error("Old password incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
};

/* ===================================================== */
/* 🔥 8. REFRESH ACCESS TOKEN */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token required");

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/* ===================================================== */
/* 🔥 9. LOGOUT */
export const logoutUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  user.refreshToken = null;
  await user.save();

  return true;
};