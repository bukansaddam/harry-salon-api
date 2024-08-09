var express = require("express");
var router = express.Router();
const orderHistoryController = require("../controllers/orderHistory.controller");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.post(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.createOrderHistory
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.getAllOrderHistory
);
router.get(
  "/store/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.getOrderHistoryByStore
);
router.get(
  "/employee",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.getOrderHistoryByEmployee
);
router.get(
  "/user",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.getOrderHistoryByUser
);
router.get(
  "/employee/total/:employeeId",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.getTotalOrderByEmployee
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  orderHistoryController.deleteOrderHistory
);

module.exports = router;
