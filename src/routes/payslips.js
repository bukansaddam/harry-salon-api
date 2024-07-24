var express = require("express");
var router = express.Router();
const payslipController = require("../controllers/payslip.controller");
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
  payslipController.createPayslip
);
router.get(
  "/all",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.getPayslip
);
router.get(
  "/",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.getPayslipByOwner
);
router.get(
  "/employee/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.getPayslipByEmployee
);
router.get(
  "/employee/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.getPayslipEmployeeByOwner
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.getDetailPayslip
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  payslipController.deletePayslip
);

module.exports = router;
