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
  orderHistory,
} = require("../../models/");
const { Op, where } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { paginate } = require("sequelize-paginate");
const cron = require("node-cron");
const midtransClient = require("midtrans-client");
const { nanoid } = require("nanoid");
const { se } = require("date-fns/locale");
const axios = require("axios");
dotenv = require("dotenv");

dotenv.config();

async function checkPaymentStatus(req, res, next) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  console.log("Checking payment status...");

  try {
    await sequelize.transaction(async (t) => {
      const ordersToCheck = await order.findAll({
        where: {
          status: "unpaid",
          // date: { [Sequelize.Op.lte]: oneDayAgo },
        },
        transaction: t,
      });

      for (const orderToCheck of ordersToCheck) {
        const orderId = orderToCheck.id;
        try {
          const response = await axios.get(
            `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(
                  process.env.MIDTRANS_SERVER_KEY
                ).toString("base64")}`,
              },
            }
          );

          if (response.status === 200) {
            const { transaction_status } = response.data;
            if (transaction_status === "settlement") {
              const maxSequenceOrder = await order.findOne({
                order: [["sequence", "DESC"]],
              });

              const newSequence = maxSequenceOrder
                ? maxSequenceOrder.sequence + 1
                : 1;

              await orderToCheck.update(
                {
                  status: "pending",
                  sequence: newSequence,
                },
                { transaction: t }
              );
            } else if (
              transaction_status === "pending" &&
              orderToCheck.updatedAt <= fifteenMinutesAgo
            ) {
              await orderToCheck.destroy({ transaction: t });
            } 
          }
          if (
            response.status === 404 ||
            orderToCheck.updatedAt <= fifteenMinutesAgo
          ) {
            console.log("Order expired:", orderToCheck.id);
            await orderToCheck.destroy({ transaction: t });
          }
        } catch (error) {
          if (
            error.response &&
            error.response.status === 404 &&
            orderToCheck.date <= oneDayAgo
          ) {
            await orderToCheck.destroy({ transaction: t });
          } else {
            console.log("Error checking payment status:", error.message);
          }
        }
      }
    });
  } catch (error) {
    console.log("Transaction error:", error.message);
  }
  next();
}

cron.schedule("* * * * *", checkPaymentStatus);

async function updateOrderStatusToDelay() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    await sequelize.transaction(async (t) => {
      const ordersToUpdate = await order.findAll({
        where: {
          status: "waiting",
          date: { [Sequelize.Op.lte]: fiveMinutesAgo },
        },
        transaction: t,
      });

      for (const orderToUpdate of ordersToUpdate) {
        const currentSequence = orderToUpdate.sequence;
        const nextOrder = await order.findOne({
          where: { sequence: currentSequence + 1 },
          transaction: t,
        });

        if (nextOrder) {
          await Promise.all([
            orderToUpdate.update(
              {
                sequence: currentSequence + 1,
                status: "pending",
                isAccepted: false,
                employeeId: null,
              },
              { transaction: t }
            ),
            nextOrder.update({ sequence: currentSequence }, { transaction: t }),
          ]);
        } else {
          await orderToUpdate.update(
            { status: "pending", isAccepted: false, employeeId: null },
            { transaction: t }
          );
        }
      }
    });

    console.log("Order sequence and status updated successfully");
  } catch (error) {
    console.error("Failed to update order sequence and status:", error);
  }
}

cron.schedule("* * * * *", updateOrderStatusToDelay);

async function createPaymentLink(req, res) {
  const { serviceId } = req.body;

  try {
    const userId = await getIdUser(req);
    const [userData, serviceData] = await Promise.all([
      user.findOne({ where: { id: userId } }),
      service.findOne({ where: { id: serviceId } }),
    ]);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const parameter = {
      transaction_details: {
        order_id: nanoid(10),
        gross_amount: serviceData.price,
      },
      item_details: [
        {
          id: serviceData.id,
          price: serviceData.price,
          quantity: 1,
          name: serviceData.name,
        },
      ],
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: userData.name,
        email: userData.email,
        phone: userData.phone,
      },
    };

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: "SB-Mid-server-v5RyKtwcoXKFjq5lMvuCnBnz",
    });

    const transactionToken = await snap.createTransaction(parameter);

    return res.status(200).json({
      success: true,
      message: "Payment link created successfully",
      data: transactionToken.redirect_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function createOrder2(req, res) {
  const {
    storeId,
    serviceId,
    description,
    hairstyleId = null,
    date,
    employeeId,
  } = req.body;

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
      hairstyleId: hairstyleId ? hairstyleId : null,
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

async function createOrder(req, res) {
  const {
    storeId,
    serviceId,
    description,
    hairstyleId = null,
    date,
    employeeId,
  } = req.body;

  try {
    const userId = await getIdUser(req);
    const [userData, serviceData] = await Promise.all([
      user.findOne({ where: { id: userId } }),
      service.findOne({ where: { id: serviceId } }),
    ]);

    const newOrder = await order.create({
      storeId,
      employeeId,
      serviceId,
      description,
      userId,
      hairstyleId: hairstyleId ? hairstyleId : null,
      date,
      sequence: 0,
    });

    const parameter = {
      transaction_details: {
        order_id: newOrder.id,
        gross_amount: serviceData.price,
      },
      item_details: [
        {
          id: serviceData.id,
          price: serviceData.price,
          quantity: 1,
          name: serviceData.name,
        },
      ],
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: userData.name,
        email: userData.email,
        phone: userData.phone,
      },
    };

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: "SB-Mid-server-v5RyKtwcoXKFjq5lMvuCnBnz",
    });

    const transactionToken = await snap.createTransaction(parameter);

    await newOrder.update({ linkPayment: transactionToken.redirect_url, status: "unpaid" });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: newOrder.linkPayment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getWaitingTime(req, res) {
  try {
    const storeId = req.params.id;
    const userId = await getIdUser(req);

    const whereClause = {
      storeId: storeId,
      status: { [Op.ne]: "done" },
      isDeleted: false,
    };

    const orders = await order.findAll({
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
        },
        {
          model: service,
          as: "service",
          attributes: ["name", "price", "duration"],
        },
        {
          model: employee,
          as: "employee",
          attributes: ["name", "avatar"],
        },
        {
          model: hairstyle,
          as: "hairstyle",
        },
        {
          model: user,
          as: "user",
          attributes: ["name", "avatar", "phone"],
        },
      ],
    });

    const totalDuration = orders.reduce(
      (acc, order) => acc + (order.service?.duration || 0),
      0
    );

    const response = {
      totalOrder: orders.length,
      totalDuration: totalDuration,
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
      isDeleted: false,
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
          attributes: ["name", "price", "duration"],
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
          attributes: ["name", "avatar", "phone"],
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
        userPhone: order.user.phone,
        storeName: order.store.name,
        storeLocation: order.store.location,
        serviceName: order.service.name,
        servicePrice: order.service.price,
        serviceDuration: order.service.duration,
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

async function getOrderEmployee(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const employeeId = await getIdUser(req);

    const employeeOrders = await order.findAll({
      attributes: ["storeId"],
    });

    if (!employeeOrders.length) {
      return res.status(404).json({
        success: false,
        message: "You have no orders",
      });
    }

    const employeeStoreIds = employeeOrders.map((order) => order.storeId);

    const whereClause = {
      storeId: { [Op.in]: employeeStoreIds },
      isDeleted: false,
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
          attributes: ["name", "avatar", "phone"],
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
        isMe: order.employeeId === employeeId,
        id: order.id,
        description: order.description,
        userName: order.user.name,
        userAvatar: order.user.avatar,
        userPhone: order.user.phone,
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
      isDeleted: false,
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
    checkPaymentStatus();
    const userId = await getIdUser(req);

    const whereClause = { userId: userId, isDeleted: false };

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
            where: { id: result.userId },
            attributes: ["name", "avatar", "phone"],
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
      linkPayment: result.linkPayment,
      orderNumber: result.sequence,
      endTime: updatedTime,
      description: result.description,
      isOnLocation: result.isOnLocation,
      isAccepted: result.isAccepted,
      status: result.status,
      userName: dataUser ? dataUser.name : "Unknown",
      userAvatar: dataUser ? dataUser.avatar : null,
      userPhone: dataUser ? dataUser.phone : null,
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
    const userId = await getIdUser(req);

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
              {
                sequence: currentSequence + 1,
                status: "pending",
                isAccepted: false,
                employeeId: null,
              },
              { transaction: t }
            ),
            nextOrder.update({ sequence: currentSequence }, { transaction: t }),
          ]);
        } else {
          await orderToUpdate.update(
            { status: "pending", isAccepted: false, employeeId: null },
            { transaction: t }
          );
        }
      } else if (isAccepted) {
        await orderToUpdate.update(
          { isAccepted: isAccepted, status: "waiting", employeeId: userId },
          { transaction: t }
        );
      } else if (isOnLocation) {
        await orderToUpdate.update(
          { isOnLocation: isOnLocation },
          { transaction: t }
        );
      } else if (status === "done") {
        await orderToUpdate.update({ status }, { transaction: t });
        await orderHistory.create(
          {
            orderId: orderToUpdate.id,
          },
          { transaction: t }
        );
      } else if (status === "cancel") {
        await orderToUpdate.update({ status }, { transaction: t });
        await orderHistory.create(
          {
            orderId: orderToUpdate.id,
          },
          { transaction: t }
        );
      } else {
        await orderToUpdate.update(
          {
            status,
          },
          { transaction: t }
        );
      }

      if (
        orderToUpdate.isAccepted === true &&
        orderToUpdate.isOnLocation === true &&
        status !== "done"
      ) {
        const currentSequence = orderToUpdate.sequence;

        // Update all orders with sequence greater than current order
        await order.update(
          { sequence: sequelize.literal("sequence - 1") },
          {
            where: { sequence: { [Op.gt]: currentSequence } },
            transaction: t,
          }
        );

        await orderToUpdate.update(
          { status: "onProcess", sequence: 0 },
          { transaction: t }
        );
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

    await existingOrder.update({ isDeleted: true, sequence: 0});

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
  createPaymentLink,
  createOrder,
  getOrder,
  getOrderEmployee,
  getOrderByService,
  getOrderById,
  getWaitingTime,
  getDetailOrder,
  updateOrder,
  deleteOrder,
  checkPaymentStatus,
};
