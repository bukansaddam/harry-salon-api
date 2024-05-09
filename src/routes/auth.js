var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");
const ownerController = require("../controllers/owner.controller");
const {
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.post("/users/signup", userController.signUp);
router.post("/users/signin", userController.signIn);
router.post(
  "/users/signout",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.signOut
);

router.post("/owners/signup", ownerController.signUp);
router.post("/owners/signin", ownerController.signIn);
router.post(
  "/owners/signout",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  ownerController.signOut
);

module.exports = router;
