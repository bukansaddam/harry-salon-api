const { is } = require("date-fns/locale");
const {
  commodity,
  commodityHistory,
  employee,
  owner,
} = require("../../models/");
const { Op } = require("sequelize");
const { uploadFileToSpace } = require("../middlewares/multer");
const { getIdUser } = require("../Utils/helper");

async function createCommodity(req, res) {
  const { name, stock, category, storeId } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const file = req.file;
    const fileName = `commodity-${Date.now()}-${file.originalname}`;

    const uploadResult = await uploadFileToSpace(
      file.buffer,
      fileName,
      "commodities"
    );

    const newCommodity = await commodity.create({
      image: uploadResult,
      name,
      stock,
      category,
      storeId,
    });

    return res.status(200).json({
      success: true,
      message: "Commodity created successfully",
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
      totalCount: result.total,
      totalPages: result.pages,
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

    const whereClause = { storeId: req.params.id, isDeleted: false };
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
      totalCount: result.total,
      totalPages: result.pages,
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
    const userId = await getIdUser(req);
    const existingCommodity = await commodity.findOne({ where: { id } });
    if (!existingCommodity) {
      return res.status(404).json({
        success: false,
        message: "Commodity not found",
      });
    }

    let username;
    let userRole;

    username = await owner.findOne({ where: { id: userId } });
    if (username) {
      userRole = "owner";
    } else {
      username = await employee.findOne({ where: { id: userId } });
      if (username) {
        userRole = "employee";
      }
    }

    if (!username) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name && name !== existingCommodity.name) {
      await commodityHistory.create({
        commodityId: existingCommodity.id,
        description: `${username.name} (as ${userRole}) changed name from ${existingCommodity.name} to ${name}`,
        createdBy: userId,
      });
      existingCommodity.name = name;
    }

    if (stock && stock !== existingCommodity.stock) {
      await commodityHistory.create({
        commodityId: existingCommodity.id,
        description: `${username.name} (as ${userRole}) changed stock from ${existingCommodity.stock} to ${stock}`,
        createdBy: userId,
      });
      existingCommodity.stock = stock;
    }

    if (category && category !== existingCommodity.category) {
      await commodityHistory.create({
        commodityId: existingCommodity.id,
        description: `${username.name} (as ${userRole}) changed category from ${existingCommodity.category} to ${category}`,
        createdBy: userId,
      });
      existingCommodity.category = category;
    }

    if (storeId) existingCommodity.storeId = storeId;

    if (req.file) {
      const file = req.file;
      const fileName = `commodity-${Date.now()}-${file.originalname}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "commodities"
      );

      commodityHistory.create({
        commodityId: existingCommodity.id,
        description: `${username.name} changed image`,
        createdBy: userId,
      });

      existingCommodity.image = uploadResult;
    }

    await existingCommodity.save();

    return res.status(200).json({
      success: true,
      message: "Commodity updated successfully",
    });
  } catch (error) {
    console.log(error);
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
    }

    existingCommodity.update({ isDeleted: true });
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
