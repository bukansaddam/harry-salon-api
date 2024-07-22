const { store, image, employee, sequelize } = require("../../models/");
const { Op, where, Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
const { getIdUser } = require("../Utils/helper");
dotenv = require("dotenv");
dotenv.config();

async function createStore(req, res) {
  const { name, description, location, latitude, longitude, openAt, closeAt } =
    req.body;
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

    const userId = await getIdUser(req);
    console.log(userId);

    const newStore = await store.create({
      name,
      description,
      location,
      latitude,
      longitude,
      openAt,
      closeAt,
      isActive: true,
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
    const searchTerm = req.query.name;
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
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["created_at", "ASC"]];

    const whereClause = { ownerId: userId };
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };
    }

    const result = await store.paginate({
      attributes: [
        "id",
        "name",
        "location",
        "isActive",
        [
          sequelize.fn("COUNT", sequelize.col("employees.id")),
          "totalEmployees",
        ],
      ],
      include: [
        {
          model: employee,
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["store.id"],
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
        message: "Store not added yet",
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

async function getDetailStore(req, res) {
  const { id } = req.params;
  try {
    const result = await store.findOne({
      where: { id },
      include: [
        {
          model: image,
          as: "images",
          attributes: ["id", "image"],
          where: { storeId: id },
        },
      ],
    });
    if (!result) {
      return res.status(200).json({
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
  const {
    name,
    description,
    location,
    latitude,
    longitude,
    openAt,
    closeAt,
    status,
    deletedImagesId = "", // Dapatkan sebagai string
  } = req.body;

  try {
    // Mengubah string yang dipisahkan koma menjadi array
    const deletedImagesArray = deletedImagesId
      ? deletedImagesId.split(",")
      : [];

      console.log('deletedImagesArray', deletedImagesArray);

    const existingStore = await store.findOne({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Update store fields
    if (name) existingStore.name = name;
    if (description) existingStore.description = description;
    if (location) existingStore.location = location;
    if (latitude) existingStore.latitude = latitude;
    if (longitude) existingStore.longitude = longitude;
    if (openAt) existingStore.openAt = openAt;
    if (closeAt) existingStore.closeAt = closeAt;
    if (status) existingStore.isActive = status;

    // Handle deleted images
    if (deletedImagesArray.length > 0) {
      const storeImages = await image.findAll({ where: { storeId: id } });

      if (!storeImages) {
        return res.status(404).json({
          success: false,
          message: "Store images not found",
        });
      }

      // Cek jika jumlah deletedImagesArray sama dengan jumlah storeImages
      // if (deletedImagesArray.length >= storeImages.length) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Cannot delete all images",
      //   });
      // }

      console.log(deletedImagesArray);

      // Hapus gambar berdasarkan ID yang diberikan
      // await image.destroy({ where: { id: deletedImagesArray } });
      for (let i = 0; i < deletedImagesArray.length; i++) {
        await image.destroy({ where: { id: deletedImagesArray[i] } });
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const storeImages = req.files.map((file) => file.path);

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
    console.error(error); // Log error for debugging
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
