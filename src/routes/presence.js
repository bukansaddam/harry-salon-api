var express = require("express");
var router = express.Router();
const presenceController = require("../controllers/presence.controller");
const { generateTokenQR, authenticateTokenQR } = require("../middlewares/qr");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  isOwner,
  isEmployee,
} = require("../middlewares/auth");

router.get("/qr/:storeId",
    authenticateToken,
    isOwner,
    presenceController.createQr);

router.post(
  "/",
  authenticateToken,
  presenceController.createPresence
);

router.get(
  "/all",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  presenceController.getPresence
);

router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  presenceController.getPresenceByUser
);

router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  presenceController.getEmployeePresence
);

module.exports = router;