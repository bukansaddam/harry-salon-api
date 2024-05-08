var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.post(
  "/signout",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.signOut
);

module.exports = router;
