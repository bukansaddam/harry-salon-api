var express = require("express");
var router = express.Router();
const hairstyleController = require("../controllers/hairstyle.controller");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isOwner,
} = require("../middlewares/auth");

router.post(
  "/",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("attachment"),
  hairstyleController.createHairstyle
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  hairstyleController.getHairstyle
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  hairstyleController.getDetailHairstyle
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  hairstyleController.deleteHairstyle
);

module.exports = router;
