
const jwt = require("jsonwebtoken");

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================
const authMiddleware = (req, res, next) => {
  try {
    // ========================================
    // GET AUTHORIZATION HEADER
    // ========================================
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    // Expected format:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    // ========================================
    // VERIFY JWT
    // ========================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================
    // STORE USER ID IN REQUEST
    // ========================================
    req.user = {
      id: decoded.id,
    };

    // Continue to controller
    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    // ========================================
    // TOKEN EXPIRED
    // ========================================
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // ========================================
    // INVALID TOKEN
    // ========================================
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // ========================================
    // OTHER AUTHENTICATION ERROR
    // ========================================
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;

