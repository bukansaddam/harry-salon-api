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
const { or } = require("sequelize");

router.post(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.createOrder
);
router.post(
  "/payment",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.createPaymentLink
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.checkPaymentStatus,
  orderController.getOrder
);
router.get(
  "/employee",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.updateOrderStatusToDelay,
  orderController.getOrderEmployee
);
router.get(
  "/current",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.updateOrderStatusToDelay,
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
  orderController.checkPaymentStatus,
  orderController.updateOrderStatusToDelay,
  orderController.getDetailOrder
);
router.get(
  "/time/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderController.getWaitingTime
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
