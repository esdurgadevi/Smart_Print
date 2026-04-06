import * as authService from "../services/authService.js";

/* 🔹 REGISTER (SEND OTP) */
export const registerUser = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 VERIFY OTP (REGISTRATION) */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyOTP(email, otp);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 LOGIN */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    // Check if it's an OTP verification error
    if (error.code === "OTP_NOT_VERIFIED") {
      return res.status(400).json({
        message: error.message,
      });
    }
    res.status(401).json({
      message: error.message,
    });
  }
};

/* 🔹 REFRESH TOKEN */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      message: "Token refreshed",
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

/* 🔹 FORGOT PASSWORD (SEND OTP) */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 VERIFY OTP (FORGOT PASSWORD) */
export const verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyForgotOTP(email, otp);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const result = await authService.resetPassword(email, newPassword);

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 CHANGE PASSWORD (LOGGED IN) */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* 🔹 LOGOUT */
export const logoutUser = async (req, res) => {
  try {
    await authService.logoutUser(req.user.id);

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};