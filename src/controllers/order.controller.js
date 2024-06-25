const {
  order,
  hairstyle,
  hairstyleImage,
  user,
  employee,
  store,
  service,
  Sequelize,
  sequelize,
} = require("../../models/");
const { Op, where } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { paginate } = require("sequelize-paginate");

async function createOrder(req, res) {
  const { storeId, serviceId, description, hairstyleId, date, employeeId } =
    req.body;

  try {
    const userId = await getIdUser(req);

    const maxSequenceOrder = await order.findOne({
      order: [["sequence", "DESC"]],
    });

    const newSequence = maxSequenceOrder ? maxSequenceOrder.sequence + 1 : 1;

    const newOrder = await order.create({
      storeId,
      employeeId,
      serviceId,
      description,
      userId,
      hairstyleId,
      date,
      sequence: newSequence,
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
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const userId = await getIdUser(req);

    const userOrders = await order.findAll({
      attributes: ["storeId"],
    });

    if (!userOrders.length) {
      return res.status(404).json({
        success: false,
        message: "You have no orders",
      });
    }

    const userStoreIds = userOrders.map((order) => order.storeId);

    const whereClause = {
      storeId: { [Op.in]: userStoreIds },
    };

    const result = await order.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: [
        ["sequence", "ASC"],
        ["createdAt", "ASC"],
      ],
      include: [
        {
          model: store,
          as: "store",
          attributes: ["name", "location"],
          duplicating: false,
        },
        {
          model: service,
          as: "service",
          attributes: ["name", "price"],
          duplicating: false,
        },
        {
          model: employee,
          as: "employee",
          attributes: ["name", "avatar"],
          duplicating: false,
        },
        {
          model: hairstyle,
          as: "hairstyle",
          duplicating: false,
        },
        {
          model: user,
          as: "user",
          attributes: ["name", "avatar"],
          duplicating: false,
        },
      ],
    });

    if (!result.docs.length) {
      return res.status(404).json({
        success: false,
        message: "You have no orders",
      });
    }

    const dataWithOrderNumber = result.docs.map((order) => {
      return {
        orderNumber: order.sequence,
        isMe: order.userId === userId,
        id: order.id,
        description: order.description,
        userName: order.user.name,
        userAvatar: order.user.avatar,
        storeName: order.store.name,
        storeLocation: order.store.location,
        serviceName: order.service.name,
        servicePrice: order.service.price,
        status: order.status,
        date: order.date,
        employeeAvatar: order.employee?.avatar,
        employeeName: order.employee?.name,
        reference: order.hairstyle || null,
      };
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: dataWithOrderNumber,
    };

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
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

async function getOrderByService(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const userId = await getIdUser(req);

    const userOrders = await order.findAll({
      where: { userId: userId },
      attributes: ["serviceId"],
    });

    if (!userOrders.length) {
      return res.status(404).json({
        success: false,
        message: "User has no orders",
      });
    }

    const userServiceIds = userOrders.map((order) => order.serviceId);

    const whereClause = {
      serviceId: { [Op.in]: userServiceIds },
    };

    const result = await order.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: store,
          as: "store",
          attributes: ["name", "location"],
          duplicating: false,
        },
        {
          model: service,
          as: "service",
          attributes: ["name", "price"],
          duplicating: false,
        },
        {
          model: employee,
          as: "employee",
          attributes: ["name", "avatar"],
          duplicating: false,
        },
        {
          model: hairstyle,
          as: "hairstyle",
          duplicating: false,
        },
        {
          model: user,
          as: "user",
          attributes: ["name", "avatar"],
          duplicating: false,
        },
      ],
    });

    if (!result.docs.length) {
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });
    }

    const dataWithOrderNumber = result.docs.map((order) => {
      return {
        orderNumber: order.sequence,
        isMe: order.userId === userId,
        id: order.id,
        description: order.description,
        userName: order.user.name,
        userAvatar: order.user.avatar,
        storeName: order.store.name,
        storeLocation: order.store.location,
        serviceName: order.service.name,
        servicePrice: order.service.price,
        status: order.status,
        date: order.date,
        employeeAvatar: order.employee?.avatar,
        employeeName: order.employee?.name,
        reference: order.hairstyle || null,
      };
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: dataWithOrderNumber,
    };

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
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

async function getOrderById(req, res) {
  try {
    const userId = await getIdUser(req);

    const whereClause = { userId: userId };

    const orderData = await order.findOne({
      where: whereClause,
      order: [["date", "DESC"]],
      include: [
        {
          model: store,
          as: "store",
          attributes: ["name", "location"],
          duplicating: false,
        },
        {
          model: service,
          as: "service",
          attributes: ["name", "price"],
          duplicating: false,
        },
        {
          model: employee,
          as: "employee",
          attributes: ["name", "avatar"],
          duplicating: false,
        },
        {
          model: hairstyle,
          as: "hairstyle",
          duplicating: false,
        },
      ],
    });

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const response = {
      id: orderData.id,
      description: orderData.description,
      storeName: orderData.store.name,
      storeLocation: orderData.store.location,
      serviceName: orderData.service.name,
      servicePrice: orderData.service.price,
      employeeAvatar: orderData.employee?.avatar,
      employeeName: orderData.employee?.name,
      reference: orderData.hairstyle,
    };

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
    // Mengambil data pesanan
    const result = await order.findOne({
      where: { id },
    });
    const userId = await getIdUser(req);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Mengambil data terkait secara paralel dengan pengecekan null
    const [
      dataHairstyle,
      dataHairstyleImage,
      dataUser,
      dataStore,
      dataService,
      dataEmployee,
    ] = await Promise.all([
      result.hairstyleId
        ? hairstyle.findOne({
            where: { id: result.hairstyleId },
            attributes: ["id", "name", "description"],
          })
        : null,
      result.hairstyleId
        ? hairstyleImage.findOne({
            where: { hairstyleId: result.hairstyleId },
          })
        : null,
      userId
        ? user.findOne({
            where: { id: userId },
            attributes: ["name", "avatar"],
          })
        : null,
      result.storeId
        ? store.findOne({
            where: { id: result.storeId },
            attributes: ["name", "location"],
          })
        : null,
      result.serviceId
        ? service.findOne({
            where: { id: result.serviceId },
            attributes: ["image", "name", "price"],
          })
        : null,
      result.employeeId
        ? employee.findOne({
            where: { id: result.employeeId },
            attributes: ["name", "avatar"],
          })
        : null,
    ]);

    const updatedTime = new Date(result.updatedAt);
    updatedTime.setMinutes(updatedTime.getMinutes() + 5);

    // Membentuk respons
    const response = {
      id: result.id,
      orderNumber: result.sequence,
      endTime: updatedTime,
      description: result.description,
      isOnLocation: result.isOnLocation,
      isAccepted: result.isAccepted,
      status: result.status,
      storeName: dataStore ? dataStore.name : "Unknown",
      storeLocation: dataStore ? dataStore.location : "Unknown",
      serviceImage: dataService ? dataService.image : null,
      serviceName: dataService ? dataService.name : "Unknown",
      servicePrice: dataService ? dataService.price : null,
      employeeAvatar: dataEmployee ? dataEmployee.avatar : null,
      employeeName: dataEmployee ? dataEmployee.name : "Unknown",
      reference: dataHairstyle
        ? {
            ...dataHairstyle.get(), // Mengambil semua atribut dari dataHairstyle
            image: dataHairstyleImage ? dataHairstyleImage.image : null, // Menambahkan gambar hairstyle
          }
        : null,
    };

    // Mengirim respons sukses
    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: response,
    });
  } catch (error) {
    // Menangani kesalahan
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function updateOrder(req, res) {
  const { id } = req.params;
  const { status, isOnLocation, isAccepted, employeeId } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      const orderToUpdate = await order.findByPk(id, { transaction: t });
      if (!orderToUpdate) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (orderToUpdate.status !== status && status === "delay") {
        const currentSequence = orderToUpdate.sequence;
        const nextOrder = await order.findOne({
          where: { sequence: currentSequence + 1 },
          transaction: t,
        });

        if (nextOrder) {
          await Promise.all([
            orderToUpdate.update(
              { sequence: currentSequence + 1, status: "pending", isAccepted: false, employeeId: null },
              { transaction: t }
            ),
            nextOrder.update({ sequence: currentSequence }, { transaction: t }),
          ]);
        } else {
          await orderToUpdate.update({ status: "pending", isAccepted: false, employeeId: null }, { transaction: t });
        }
      } else if (isAccepted) {
        await orderToUpdate.update(
          { isAccepted: isAccepted, status: "waiting", employeeId },
          { transaction: t }
        );
      } else if (isOnLocation) {
        await orderToUpdate.update(
          { isOnLocation: isOnLocation },
          { transaction: t }
        );
      } else if (status === "done") {
        console.log("done");
      } else {
        await orderToUpdate.update(
          {
            status,
          },
          { transaction: t }
        );
      }

      if (orderToUpdate.isAccepted === true && orderToUpdate.isOnLocation === true) {
        await orderToUpdate.update({ status: "onProcess" }, { transaction: t });
      }

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
      });
    });
  } catch (error) {
    console.log(error);
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

    const deletedOrderSequence = existingOrder.sequence;

    await existingOrder.destroy();

    await order.update(
      { sequence: Sequelize.literal("sequence - 1") },
      {
        where: {
          sequence: {
            [Op.gt]: deletedOrderSequence,
          },
        },
      }
    );

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
  getOrderByService,
  getOrderById,
  getDetailOrder,
  updateOrder,
  deleteOrder,
};
