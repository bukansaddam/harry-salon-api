const jwt = require("jsonwebtoken");
const { user } = require("../../models");
const { owner } = require("../../models");
const { employee } = require("../../models");
dotenv = require("dotenv");
dotenv.config();

const authData = {
  blacklistedTokens: [],
};

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "60d",
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Access token not provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid access token",
      });
    }
    req.user = user;
    next();
  });
}

function authenticateRefreshToken(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next();
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid refresh token",
      });
    }
    req.user = user;
    next();
  });
}

function checkBlacklist(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (token && authData.blacklistedTokens.includes(token)) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Token has been revoked" });
  }
  next();
}

function clearToken(token) {
  authData.blacklistedTokens.push(token);
}

async function isOwner(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Access token not provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const existingOwner = await owner.findOne({ where: { id: userId } });

    if (existingOwner) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: "Forbidden: You do not have permission to access this resource",
      });
    }
  } catch (error) {
    console.error("Error in isOwner middleware:", error);
    res.status(403).json({
      success: false,
      error: "Forbidden: Invalid access token",
    });
  }
}

async function isEmployee(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Access token not provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const existingEmployee = await employee.findOne({ where: { id: userId } });

    if (existingEmployee) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: "Forbidden: You do not have permission to access this resource",
      });
    }
  } catch (error) {
    console.error("Error in isEmployee middleware:", error);
    res.status(403).json({
      success: false,
      error: "Forbidden: Invalid access token",
    });
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  authData,
  clearToken,
  isOwner,
  isEmployee,
};
