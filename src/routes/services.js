var express = require("express");
var router = express.Router();
const serviceController = require("../controllers/service.controller");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isOwner,
} = require("../middlewares/auth");

router.post(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("image"),
  serviceController.createService
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  serviceController.getService
);
router.get(
  "/store/:id",
  serviceController.getServiceByStore
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  serviceController.getDetailService
);
router.put(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("image"),
  serviceController.updateService
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  serviceController.deleteService
);

module.exports = router;
