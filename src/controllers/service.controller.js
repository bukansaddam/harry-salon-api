const { service } = require("../../models/");
const { Op } = require("sequelize");
const { uploadFileToSpace } = require("../middlewares/multer");

async function createService(req, res) {
  const { name, price, duration, storeId } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const file = req.file;
    const fileName = `service-${Date.now()}-${file.originalname}`;

    const uploadResult = await uploadFileToSpace(file.buffer, fileName, "services");
    
    const newService = await service.create({
      image: uploadResult,
      name,
      price,
      duration,
      storeId,
    });

    return res.status(200).json({
      success: true,
      message: "Service created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getService(req, res) {
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

    const result = await service.paginate({
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
        message: "Service not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
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

async function getServiceByStore(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = { storeId: req.params.id, isDeleted: false };
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await service.paginate({
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
        message: "Service not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
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

async function getDetailService(req, res) {
  const { id } = req.params;
  try {
    const result = await service.findOne({ where: { id } });
    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Service not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateService(req, res) {
  const { id } = req.params;
  const { name, price, duration, storeId } = req.body;

  try {
    const existingService = await service.findOne({ where: { id } });
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (name) existingService.name = name;
    if (price) existingService.price = price;
    if (duration) existingService.duration = duration;
    if (storeId) existingService.storeId = storeId;
    if (req.file) {
      const file = req.file;
      const fileName = `service-${Date.now()}-${file.originalname}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "services"
      );

      existingEmployee.image = uploadResult;
    }

    await existingService.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteService(req, res) {
  const { id } = req.params;
  try {
    const existingService = await service.findOne({ where: { id } });
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    await existingService.update({ isDeleted: true });
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createService,
  getService,
  getServiceByStore,
  getDetailService,
  updateService,
  deleteService,
};
