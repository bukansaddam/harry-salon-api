const {
  store,
  image,
  employee,
  sequelize,
  service,
  order,
} = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const jwt = require("jsonwebtoken");
const { getIdUser } = require("../Utils/helper");
const {
  uploadFileToSpace,
  deleteFileFromSpace,
} = require("../middlewares/multer");
const { config } = require("dotenv");

config();

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
      ownerId: userId,
    });

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `store-${Date.now()}-${file.originalname}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "stores"
      );
      uploadedImages.push(uploadResult);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      await image.create({
        image: uploadedImages[i],
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

    const whereClause = { isActive: true, isDeleted: false };
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
      totalCount: result.total,
      totalPages: result.pages,
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

    let orders = [["created_at", "ASC"]];

    const whereClause = { ownerId: userId, isDeleted: false };
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
          literal(`(
            SELECT COUNT(*)
            FROM employees
            WHERE employees.storeId = store.id AND employees.isDeleted = false
          )`),
          "totalEmployees",
        ],
        [
          literal(`(
            SELECT IFNULL(SUM(services.price), 0)
            FROM orders
            JOIN services ON orders.serviceId = services.id
            WHERE orders.storeId = store.id AND orders.status = 'done'
          )`),
          "totalRevenue",
        ],
      ],
      include: [
        {
          model: employee,
          attributes: [],
          duplicating: false,
        },
        {
          model: order,
          attributes: [],
          duplicating: false,
        },
        {
          model: service,
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["store.id"],
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: orders,
    });

    result.docs.forEach((store) => {
      console.log("Store dataValues:", store.dataValues);
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
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
    deletedImagesId = "",
  } = req.body;

  try {
    const deletedImagesArray = deletedImagesId
      ? deletedImagesId.split(",")
      : [];

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
    if (latitude) existingStore.latitude = latitude;
    if (longitude) existingStore.longitude = longitude;
    if (openAt) existingStore.openAt = openAt;
    if (closeAt) existingStore.closeAt = closeAt;
    if (status) existingStore.isActive = status;

    if (deletedImagesArray.length > 0) {
      const storeImages = await image.findAll({ where: { storeId: id } });

      if (!storeImages) {
        return res.status(404).json({
          success: false,
          message: "Store images not found",
        });
      }

      for (let i = 0; i < deletedImagesArray.length; i++) {
        const img = await image.findOne({
          where: { id: deletedImagesArray[i] },
        });
        if (img) {
          const fileKey = img.image.split("/").pop();
          await deleteFileFromSpace(fileKey, "stores");
          await img.destroy();
        }
      }
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileName = `store-${Date.now()}-${file.originalname}`;

        const uploadResult = await uploadFileToSpace(
          file.buffer,
          fileName,
          "stores"
        );
        uploadedImages.push(uploadResult);
      }

      for (let i = 0; i < uploadedImages.length; i++) {
        await image.create({
          image: uploadedImages[i],
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
    console.error(error);
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
    await existingStore.update({ isDeleted: true });
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
