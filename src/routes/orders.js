var express = require("express");
var router = express.Router();
const orderController = require("../controllers/order.controller");
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
  orderController.createOrder
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.getOrder
);
router.get(
  "/current",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.getOrderById
);
router.get(
  "/service",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.getOrderByService
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.getDetailOrder
);
router.put(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.updateOrder
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.deleteOrder
);

module.exports = router;
