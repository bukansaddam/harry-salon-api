var express = require("express");
var router = express.Router();
const reviewController = require("../controllers/review.controller");
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
  reviewController.createReview
);
router.get(
  "/",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  reviewController.getReview
);
router.get(
  "/store/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  reviewController.getReviewByStore
);
router.get(
  "/:id",
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  reviewController.getDetailReview
);
router.put(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  reviewController.updateReview
);
router.delete(
  "/:id",
  isOwner,
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
  reviewController.deleteReview
);

module.exports = router;
