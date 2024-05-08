var express = require("express");
var router = express.Router();
const userController = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.getUser
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.getDetailUser
);
router.put(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("avatar"),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  userController.deleteUser
);

module.exports = router;
