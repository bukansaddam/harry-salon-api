const { review, user, store } = require("../../models/");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");

async function createReview(req, res) {
  const { rating, comment, storeId } = req.body;

  try {
    const userId = await getIdUser(req);
    const newReview = await review.create({
      rating,
      comment,
      date: Date.now(),
      userId,
      storeId,
    });

    return res.status(200).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getReview(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["createdAt", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await review.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: [{
        model: store,
        attributes: ["id"],
        duplicating: false,
      },{
        model: user,
        attributes: ["name", "avatar"],
        duplicating: false,
      }],
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs.map((review) => {
        return {
          id: review.id,
          avatar: review.user.avatar,
          username: review.user.name,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          storeId: review.store.id,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Review not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      result: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getReviewByStore(req, res) {
  try {
    const searchTerm = req.query.rating;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const userId = await getIdUser(req);

    let order = [["rating", "DESC"]];

    const whereClause = { storeId: req.params.id };
    if (searchTerm) {
      whereClause.rating = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await review.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: [
        {
          model: store,
          attributes: ["id"],
          duplicating: false,
        },
        {
          model: user,
          attributes: ["name", "avatar"],
          duplicating: false,
        },
      ],
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs.map((review) => {
        return {
          id: review.id,
          isMe: userId == review.userId,
          avatar: review.user.avatar,
          username: review.user.name,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Review not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      result: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getDetailReview(req, res) {
  const { id } = req.params;
  try {
    const result = await review.findOne({ where: { id } });
    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Review not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateReview(req, res) {
  const { id } = req.params;
  const { name, stock, storeId } = req.body;

  try {
    const existingReview = await review.findOne({ where: { id } });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (name) existingReview.name = name;
    if (stock) existingReview.stock = stock;
    if (storeId) existingReview.storeId = storeId;
    if (req.file) existingReview.image = req.file.path;

    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteReview(req, res) {
  const { id } = req.params;
  try {
    const existingReview = await review.findOne({ where: { id } });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    await existingReview.destroy();
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createReview,
  getReview,
  getReviewByStore,
  getDetailReview,
  updateReview,
  deleteReview,
};
