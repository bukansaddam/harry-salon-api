var express = require("express");
var router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isOwner,
} = require("../middlewares/auth");

router.post("/employees", employeeController.createEmployee);

router.get(
  "/",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  employeeController.getEmployee
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  employeeController.getDetailEmployee
);
router.put(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.single("avatar"),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  employeeController.deleteEmployee
);

module.exports = router;
