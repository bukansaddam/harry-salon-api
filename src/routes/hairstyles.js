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
  upload.array("image"),
  hairstyleController.createHairstyle
);
router.get(
  "/",
  hairstyleController.getHairstyle
);
router.get(
  "/:id",
  hairstyleController.getDetailHairstyle
);
router.put(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.array("image"),
  hairstyleController.updateHairstyle
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
