var express = require("express");
var router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
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
  favoriteController.createFavorite
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  favoriteController.getFavorite
);
router.delete(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  favoriteController.deleteFavorite
);

module.exports = router;
