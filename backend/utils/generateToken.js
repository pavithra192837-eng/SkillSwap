
const jwt = require("jsonwebtoken");

// ========================================
// GENERATE JWT TOKEN
// ========================================
const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;

