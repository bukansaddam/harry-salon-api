const {
  orderHistory,
  order,
  store,
  service,
  hairstyle,
  hairstyleImage,
  employee,
  user,
} = require("../../models/");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { format, addDays } = require("date-fns");
const moment = require("moment-timezone");
const { da } = require("date-fns/locale");

async function createOrderHistory(req, res) {
  const { orderId } = req.body;

  try {
    await orderHistory.create({
      orderId,
    });

    return res.status(200).json({
      success: true,
      message: "Added to Order History",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function getAllOrderHistory(req, res) {
  try {
    const searchDate = req.query.date;
    const searchDateStart = req.query.dateStart;
    const searchDateEnd = req.query.dateEnd;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let listOrder = [["createdAt", "ASC"]];

    const whereClause = {};

    if (searchDate) {
      whereClause.createdAt = {
        [Op.eq]: new Date(searchDate),
      };
    } else if (searchDateStart && searchDateEnd) {
      whereClause.createdAt = {
        [Op.between]: [new Date(searchDateStart), new Date(searchDateEnd)],
      };
    } else if (searchDateStart) {
      whereClause.createdAt = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClause.createdAt = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    let includeClause = [
      {
        model: order,
        as: "order",
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
            duplicating: false,
          },
        ],
      },
    ];

    const result = await orderHistory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: listOrder,
      include: includeClause,
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs.map((item) => {
        return {
          id: item.id,
          orderId: item.orderId,
          userId: item.userId,
          serviceName: item.order.service.name,
          servicePrice: item.order.service.price,
          orderDate: item.order.date,
          orderDescription: item.order.description,
          status: item.order.status,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get order history successfully",
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

async function getOrderHistoryByStore(req, res) {
  try {
    const storeId = req.params.id;
    const searchDate = req.query.date;
    const searchDateStart = req.query.dateStart;
    const searchDateEnd = req.query.dateEnd;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const today = moment(Date.now())
      .tz("Asia/Jakarta")
      .add(7, "hours")
      .format();
    const weekAgo = addDays(new Date(today), -7);

    const userId = await getIdUser(req);

    let listOrder = [["createdAt", "DESC"]];

    const whereClause = {};
    const whereClauseGraph = {};

    if (searchDateStart && searchDateEnd) {
      whereClauseGraph.createdAt = {
        [Op.and]: [
          { [Op.gte]: new Date(searchDateStart) },
          { [Op.lte]: new Date(searchDateEnd) },
        ],
      };
    } else if (searchDateStart) {
      whereClauseGraph.createdAt = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClauseGraph.createdAt = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    if (searchDate) {
      whereClause.createdAt = {
        [Op.eq]: new Date(searchDate),
      };
    } else if (searchDateStart && searchDateEnd) {
      whereClause.createdAt = {
        [Op.and]: [
          { [Op.gte]: new Date(searchDateStart) },
          { [Op.lte]: new Date(searchDateEnd) },
        ],
      };
    } else if (searchDateStart) {
      whereClause.createdAt = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClause.createdAt = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    let includeClause = [
      {
        model: order,
        as: "order",
        where: { storeId: storeId },
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
            duplicating: false,
          },
        ],
      },
    ];

    const graph = await orderHistory.findAll({
      where: whereClauseGraph,
      order: [["createdAt", "ASC"]],
      include: includeClause,
    });

    const result = await orderHistory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: listOrder,
      include: includeClause,
    });

    const orderCountByDay = {};
    for (let i = 0; i < 7; i++) {
      const date = format(
        addDays(searchDateStart ? new Date(searchDateStart) : weekAgo, i),
        "yyyy-MM-dd"
      );
      orderCountByDay[date] = {
        fullDate: date,
        dayOfMonth: format(new Date(date), "dd"),
        count: 0,
      };
    }

    graph.forEach((order) => {
      const fullDate = format(new Date(order.createdAt), "yyyy-MM-dd");
      orderCountByDay[fullDate].count++;
    });

    const sortedOrderCountByDay = Object.keys(orderCountByDay)
      .sort()
      .map((fullDate) => {
        return {
          date: orderCountByDay[fullDate].dayOfMonth,
          count: orderCountByDay[fullDate].count,
        };
      });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      graph: sortedOrderCountByDay,
      data: result.docs.map((item) => {
        return {
          id: item.id,
          orderId: item.orderId,
          storeId: item.order.storeId,
          handledBy: item.order.employeeId,
          serviceName: item.order.service.name,
          servicePrice: item.order.service.price,
          orderDate: item.order.date,
          orderDescription: item.order.description,
          status: item.order.status,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get order history successfully",
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

async function getOrderHistoryByUser(req, res) {
  try {
    const searchDate = req.query.date;
    const searchDateStart = req.query.dateStart;
    const searchDateEnd = req.query.dateEnd;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    let listOrder = [["createdAt", "ASC"]];

    const whereClause = {};

    if (searchDate) {
      whereClause.createdAt = {
        [Op.eq]: new Date(searchDate),
      };
    } else if (searchDateStart && searchDateEnd) {
      whereClause.createdAt = {
        [Op.between]: [new Date(searchDateStart), new Date(searchDateEnd)],
      };
    } else if (searchDateStart) {
      whereClause.createdAt = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClause.createdAt = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    let includeClause = [
      {
        model: order,
        as: "order",
        where: { userId: userId },
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
            duplicating: false,
          },
        ],
      },
    ];

    const result = await orderHistory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: listOrder,
      include: includeClause,
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      graph: [],
      data: result.docs.map((item) => {
        return {
          id: item.id,
          orderId: item.orderId,
          storeId: item.order.storeId,
          serviceName: item.order.service.name,
          servicePrice: item.order.service.price,
          orderDate: item.order.date,
          orderDescription: item.order.description,
          status: item.order.status,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get order history successfully",
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

async function getOrderHistoryByEmployee(req, res) {
  try {
    const searchDate = req.query.date;
    const searchDateStart = req.query.dateStart;
    const searchDateEnd = req.query.dateEnd;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    let listOrder = [["createdAt", "ASC"]];

    const whereClause = {};

    if (searchDate) {
      whereClause.createdAt = {
        [Op.eq]: new Date(searchDate),
      };
    } else if (searchDateStart && searchDateEnd) {
      whereClause.createdAt = {
        [Op.between]: [new Date(searchDateStart), new Date(searchDateEnd)],
      };
    } else if (searchDateStart) {
      whereClause.createdAt = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClause.createdAt = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    let includeClause = [
      {
        model: order,
        as: "order",
        where: { employeeId: userId },
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
            duplicating: false,
          },
        ],
      },
    ];

    const result = await orderHistory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: listOrder,
      include: includeClause,
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      graph: [],
      data: result.docs.map((item) => {
        return {
          id: item.id,
          orderId: item.orderId,
          storeId: item.order.storeId,
          serviceName: item.order.service.name,
          servicePrice: item.order.service.price,
          orderDate: item.order.date,
          orderDescription: item.order.description,
          status: item.order.status,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get order history successfully",
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

async function getTotalOrderByEmployee(req, res) {
  const { employeeId } = req.params;

  try {
    const thirtydaysago = addDays(new Date(), -30);

    if (!employeeId){
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      })
    }

    const totalHistory = await orderHistory.count({
      include: {
        model: order,
        as: "order",
        where: { employeeId, date: { [Op.gte]: thirtydaysago } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Get total order history successfully",
      result: totalHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


async function deleteOrderHistory(req, res) {
  const { id } = req.params;
  try {
    const existingOrderHistory = await orderHistory.findOne({ where: { id } });
    if (!existingOrderHistory) {
      return res.status(404).json({
        success: false,
        message: "Order History not found",
      });
    }
    await existingOrderHistory.destroy();
    return res.status(200).json({
      success: true,
      message: "Order History deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createOrderHistory,
  getAllOrderHistory,
  getOrderHistoryByStore,
  getOrderHistoryByUser,
  getOrderHistoryByEmployee,
  getTotalOrderByEmployee,
  deleteOrderHistory,
};
