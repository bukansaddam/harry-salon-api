const { is } = require("date-fns/locale");
const { commodity } = require("../../models/");
const { Op } = require("sequelize");

async function createCommodity(req, res) {
  const { name, stock, category, storeId } = req.body;

  try {
    const commodityImage = req.file.path;
    const newCommodity = await commodity.create({
      image: commodityImage,
      name,
      stock,
      category,
      storeId,
    });

    return res.status(200).json({
      success: true,
      message: "Commodity created successfully",
      data: newCommodity,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getCommodity(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await commodity.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Commodity not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commodity retrieved successfully",
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

async function getCommodityByStore(req, res) {
  try {
    const searchTerm = req.query.name;
    const searchCategory = req.query.category;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {storeId: req.params.id, isDeleted: false};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    if (searchCategory) {
      whereClause.category = { [Op.like]: `%${searchCategory}%` };

      order = [];
    }

    const result = await commodity.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Commodity not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commodity retrieved successfully",
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

async function getDetailCommodity(req, res) {
  const { id } = req.params;
  try {
    const result = await commodity.findOne({ where: { id } });
    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Commodity not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Commodity retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateCommodity(req, res) {
  const { id } = req.params;
  const { name, stock, category, storeId } = req.body;

  try {
    const existingCommodity = await commodity.findOne({ where: { id } });
    if (!existingCommodity) {
      return res.status(404).json({
        success: false,
        message: "Commodity not found",
      });
    }

    if (name) existingCommodity.name = name;
    if (stock) existingCommodity.stock = stock;
    if (category) existingCommodity.category = category;
    if (storeId) existingCommodity.storeId = storeId;
    if (req.file) existingCommodity.image = req.file.path;

    await existingCommodity.save();

    return res.status(200).json({
      success: true,
      message: "Commodity updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteCommodity(req, res) {
  const { id } = req.params;
  try {
    const existingCommodity = await commodity.findOne({ where: { id } });
    if (!existingCommodity) {
      return res.status(404).json({
        success: false,
        message: "Commodity not found",
      });
    };

    existingCommodity.isDeleted = true;
    await existingCommodity.save();

    return res.status(200).json({
      success: true,
      message: "Commodity deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createCommodity,
  getCommodity,
  getCommodityByStore,
  getDetailCommodity,
  updateCommodity,
  deleteCommodity,
};
