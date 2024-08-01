const { favorite, hairstyle, hairstyleImage } = require("../../models/");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");

async function createFavorite(req, res) {
  const { hairstyleId } = req.body;

  try {
    const userId = await getIdUser(req);

    await favorite.create({
      userId,
      hairstyleId,
    });

    return res.status(200).json({
      success: true,
      message: "Added to favorite",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getFavorite(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    let order = [["createdAt", "ASC"]];

    const whereClause = { userId: userId };
    let includeClause = [
      {
        model: hairstyle,
        as: "hairstyle",
        include: [
          {
            model: hairstyleImage,
            as: "hairstyleImages",
          },
        ],
      },
    ];

    if (searchTerm) {
      includeClause[0].where = { name: { [Op.like]: `%${searchTerm}%` } };
      order = [];
    }

    const result = await favorite.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: includeClause,
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs.map((favorite) => {
        const firstImage =
          favorite.hairstyle.hairstyleImages.length > 0
            ? favorite.hairstyle.hairstyleImages[0].image
            : null;
        return {
          id: favorite.id,
          hairstyleId: favorite.hairstyle.id,
          name: favorite.hairstyle.name,
          description: favorite.hairstyle.description,
          images: firstImage,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get favorite successfully",
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

async function deleteFavorite(req, res) {
  const { id } = req.params;
  try {
    const existingFavorite = await favorite.findOne({ where: { id } });
    if (!existingFavorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }
    await existingFavorite.destroy();
    return res.status(200).json({
      success: true,
      message: "Favorite deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createFavorite,
  getFavorite,
  deleteFavorite,
};
