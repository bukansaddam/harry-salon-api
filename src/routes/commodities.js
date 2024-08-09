var express = require("express");
var router = express.Router();
const commodityController = require("../controllers/commodity.controller");
const commodityHistoryController = require("../controllers/commodityHistory.controller");
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
  commodityController.createCommodity
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityController.getCommodity
);
router.get(
  "/store/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityController.getCommodityByStore
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityController.getDetailCommodity
);
router.post(
  "/history",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityHistoryController.createCommodityHistory
)
router.get(
  "/store/history/:storeId",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityHistoryController.getHistoryByStore
)
router.put(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("image"),
  commodityController.updateCommodity
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  commodityController.deleteCommodity
);

module.exports = router;
