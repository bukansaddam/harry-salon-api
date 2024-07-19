const jwt = require("jsonwebtoken");
const { store } = require("../../models");
dotenv = require("dotenv");
dotenv.config();

const authData = {
  blacklistedTokens: [],
};

function generateTokenQR(store) {
  return jwt.sign(
    {
      id: store,
      storeId: store,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "20s",
    }
  );
}

function authenticateTokenQR(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Access token not provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, store) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid access token",
      });
    }
    req.store = store;
    next();
  });
}

module.exports = { generateTokenQR, authenticateTokenQR }