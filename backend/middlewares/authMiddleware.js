import jwt from "jsonwebtoken";

import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get full user from DB (BEST PRACTICE)
    const user = await User.findByPk(decoded.id);
    console.log("DECODED:", decoded);
    console.log("USER FROM DB:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user
    req.user = user;

    // ✅ Continue only if everything is valid
    next();

  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid token",
      error: error.message
    });
  }
};
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // check user exists
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};