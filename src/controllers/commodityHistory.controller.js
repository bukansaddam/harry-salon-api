const {commodity, commodityHistory} = require("../../models");
const { Op } = require("sequelize");

async function createCommodityHistory(req, res) {
  const { commodityId, description } = req.body;

  try {
    const userId = await getIdUser(req);

    const newCommodityHistory = await commodityHistory.create({
      commodityId,
      description,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Commodity history created successfully",
      data: newCommodityHistory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getHistoryByStore(req, res) {
  const { storeId } = req.params;

  try {
    const commodityData = await commodity.findAll({ where: { storeId } });
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const whereClause = {
      commodityId: { [Op.in]: commodityData.map((commodity) => commodity.id) },
    };

    const result = await commodityHistory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs,
    };

    if (!result.docs.length) {
      return res.status(404).json({
        success: false,
        message: "Commodity history not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Commodity history retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
    
}

module.exports = {
  createCommodityHistory,
  getHistoryByStore
}