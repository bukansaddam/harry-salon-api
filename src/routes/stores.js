var express = require("express");
var router = express.Router();
const storeController = require("../controllers/store.controller");
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
  upload.array("images"),
  storeController.createStore
);
router.get(
  "/",
  storeController.getStore
);
router.get(
  "/all",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  storeController.getAllStoreById
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  storeController.getDetailStore
);
router.put(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  upload.array("images"),
  storeController.updateStore
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  storeController.deleteStore
);

module.exports = router;
