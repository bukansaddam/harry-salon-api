const jwt = require("jsonwebtoken");
dotenv = require("dotenv");
dotenv.config();

async function getIdUser() {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
}

module.exports = {
    getIdUser,
    };