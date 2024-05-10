const { hairstyle } = require("../../models/");
const { Op } = require("sequelize");

async function createHairstyle(req, res) {
  const { name, description } = req.body;

  try {
    const hairstyleImage = req.file.path;
    const newHairstyle = await hairstyle.create({
      image : hairstyleImage,
      name,
      description
    });

    return res.status(200).json({
      success: true,
      message: "Hairstyle created successfully",
      data: newHairstyle,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getHairstyle(req, res) {
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

    const result = await hairstyle.paginate({
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
        message: "Hairstyle not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hairstyle retrieved successfully",
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

async function getDetailHairstyle(req, res) {
  const { id } = req.params;
  try {
    const result = await hairstyle.findOne({ where: { id } });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Hairstyle not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Hairstyle retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateHairstyle(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const existingHairstyle = await hairstyle.findOne({ where: { id } });
    if (!existingHairstyle) {
      return res.status(404).json({
        success: false,
        message: "Hairstyle not found",
      });
    }

    if (name) existingHairstyle.name = name;
    if (description) existingHairstyle.description = description;
    if (req.file) existingHairstyle.image = req.file.path;

    await existingHairstyle.save();

    return res.status(200).json({
      success: true,
      message: "Hairstyle updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteHairstyle(req, res) {
  const { id } = req.params;
  try {
    const existingHairstyle = await hairstyle.findOne({ where: { id } });
    if (!existingHairstyle) {
      return res.status(404).json({
        success: false,
        message: "Hairstyle not found",
      });
    }
    await existingHairstyle.destroy();
    return res.status(200).json({
      success: true,
      message: "Hairstyle deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createHairstyle,
  getHairstyle,
  getDetailHairstyle,
  updateHairstyle,
  deleteHairstyle,
};
