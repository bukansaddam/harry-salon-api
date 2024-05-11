const { store, image } = require("../../models/");
const { Op, where } = require("sequelize");
const jwt = require("jsonwebtoken");
dotenv = require("dotenv");
dotenv.config();

async function createStore(req, res) {
  const { name, description, location, open, close, status } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token is missing",
    });
  }

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const storeImages = req.files.map((file) => file.path);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    const newStore = await store.create({
      name,
      description,
      location,
      open,
      close,
      status,
      ownerId: userId,
    });

    for (let i = 0; i < storeImages.length; i++) {
      await image.create({
        image: storeImages[i],
        storeId: newStore.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store created successfully",
      data: newStore,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getStore(req, res) {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await store.paginate({
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
      return res.status(404).json({
        message: "Store not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store retrieved successfully",
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

async function getAllStoreById(req, res) {
  const { id } = req.params;
  try {
    const result = await store.findAll({ where: { ownerId: id } });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Store retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getDetailStore(req, res) {
  const { id } = req.params;
  try {
    const result = await store.findOne({ where: { id }, include: [{
      model: image,
      as: "images",
      attributes: ["image"],
      where: { storeId: id },
    }] });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Store retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateStore(req, res) {
  const { id } = req.params;
  const { name, description, location, open, close, status } = req.body;

  try {
    const existingStore = await store.findOne({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (name) existingStore.name = name;
    if (description) existingStore.description = description;
    if (location) existingStore.location = location;
    if (open) existingStore.open = open;
    if (close) existingStore.close = close;
    if (status) existingStore.status = status;
    if (req.files && req.files.length > 0) {
      const storeImages = req.files.map((file) => file.path);

      await image.destroy({ where: { storeId: id } });

      for (let i = 0; i < storeImages.length; i++) {
        await image.create({
          image: storeImages[i],
          storeId: id,
        });
      }
    }

    await existingStore.save();

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteStore(req, res) {
  const { id } = req.params;
  try {
    const existingStore = await store.findOne({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }
    await existingStore.destroy();
    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createStore,
  getStore,
  getAllStoreById,
  getDetailStore,
  updateStore,
  deleteStore,
};
