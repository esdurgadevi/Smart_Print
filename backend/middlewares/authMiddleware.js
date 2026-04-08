import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  console.log("SECRET:", process.env.JWT_SECRET);
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("ERROR:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
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