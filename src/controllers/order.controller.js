const { order, hairstyle, user, employee, store } = require("../../models/");
const { Op, where } = require("sequelize");
const { getIdUser } = require("../Utils/helper");

async function createOrder(req, res) {
  const {
    storeId,
    employeeId,
    service_name,
    service_price,
    description,
    hairstyleId,
  } = req.body;

  try {
    const userId = await getIdUser();
    const newOrder = await order.create({
      storeId,
      employeeId,
      service_name,
      service_price,
      description,
      userId,
      hairstyleId,
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getOrder(req, res) {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let orders = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      orders = [];
    }

    const result = await order.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: orders,
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(404).json({
        message: "Order not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
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

async function getDetailOrder(req, res) {
  const { id } = req.params;
  try {
    const result = await order.findOne({
      where: { id },
    });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const dataHairstyle = await hairstyle.findOne({
      where: { id: result.hairstyleId },
      attributes: ["image"],
    });

    const dataUser = await user.findOne({
      where: { id: result.userId },
      attributes: ["name", "image"],
    });

    const dataStore = await store.findOne({
      where: { id: result.storeId },
      attributes: ["id"],
    });

    const dataEmployee = await employee.findOne({
      where: { id: result.employeeId },
      attributes: ["name", "image"],
    });

    const response = {
      id: result.id,
      user: dataUser,
      store: dataStore,
      employee: dataEmployee,
      service_name: result.service_name,
      service_price: result.service_price,
      description: result.description,
      hairstyle: dataHairstyle,
      status: result.status,
    };

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
}

async function updateOrder(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const existingOrder = await order.findOne({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status) existingOrder.status = status;

    await existingOrder.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteOrder(req, res) {
  const { id } = req.params;
  try {
    const existingOrder = await order.findOne({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    await existingOrder.destroy();
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createOrder,
  getOrder,
  getDetailOrder,
  updateOrder,
  deleteOrder,
};
