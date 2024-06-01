const { limit } = require("firebase/firestore");
const { hairstyle, hairstyleImage } = require("../../models/");
const { Op } = require("sequelize");

async function createHairstyle(req, res) {
  const { name, description } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const images = req.files.map((file) => file.path);

    const newHairstyle = await hairstyle.create({
      name,
      description,
    });

    for (let i = 0; i < images.length; i++) {
      await hairstyleImage.create({
        image: images[i],
        hairstyleId: newHairstyle.id,
      });
    }

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
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };
      order = [];
    }

    const result = await hairstyle.paginate({
      attributes: ["id", "name", "description"],
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: [
        {
          model: hairstyleImage,
          attributes: ["image"],
          duplicating: false,
          limit: 1,
        },
      ],
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs.map((hairstyle) => {
        const firstImage =
          hairstyle.hairstyleImages.length > 0
            ? hairstyle.hairstyleImages[0].image
            : null;
        return {
          id: hairstyle.id,
          name: hairstyle.name,
          description: hairstyle.description,
          image: firstImage,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
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
    const result = await hairstyle.findOne({
      where: { id },
      include: [
        {
          model: hairstyleImage,
          attributes: ["image"],
          where: { hairstyleId: id },
        },
      ],
    });

    const response = {
      id: result.id,
      name: result.name,
      description: result.description,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      images: result.hairstyleImages.map((image) => image.image),
    };

    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Hairstyle not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Hairstyle retrieved successfully",
      data: response,
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
