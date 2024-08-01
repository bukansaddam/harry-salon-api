const {
  store,
  user,
  presence,
  logPresence,
  employee,
} = require("../../models/");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { generateTokenQR } = require("../middlewares/qr");
const { decode } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

async function createQr(req, res) {
  const { storeId } = req.params;
  try {
    const token = generateTokenQR(storeId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Presence created successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function createPresence(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "JWT token must be provided",
    });
  }

  try {
    const userId = await getIdUser(req);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employeeData = await employee.findOne({ where: { id: userId } });
    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employeeData.storeId !== decoded.storeId) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }

    const time = moment(Date.now()).tz("Asia/Jakarta").add(7, "hours").format();
    // const time = Date.now();

    console.log(time);

    await logPresence.create({
      employeeId: userId,
      storeId: decoded.storeId,
      timeStamp: time,
    });

    const existingPresence = await presence.findOne({
      where: {
        employeeId: userId,
        storeId: decoded.storeId,
      },
    });

    if (existingPresence) {
      const formattedDate = moment(existingPresence.date).format("YYYY-MM-DD");
      const formattedTime = moment(time).format("YYYY-MM-DD");

      if (formattedDate == formattedTime) {
        existingPresence.exitTime = time;
        await existingPresence.save();
      } else {
        await presence.create({
          employeeId: userId,
          storeId: decoded.storeId,
          date: time,
          entryTime: time,
        });
      }
    } else {
      await presence.create({
        employeeId: userId,
        storeId: decoded.storeId,
        date: time,
        entryTime: time,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Presence created successfully",
    });
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: JWT token has expired",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

async function getPresence(req, res) {
  try {
    const presences = await presence.findAll({
      order: [["date", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Presence created successfully",
      data: presences,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getPresenceByUser(req, res) {
  try {
    const searchTerm = req.query.date;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    let order = [["createdAt", "DESC"]];

    const whereClause = { employeeId: userId };
    if (searchTerm) {
      whereClause.date = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await presence.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    // const response = {
    //   totalCount: result.total,
    //   totalPages: result.pages,
    //   data: result.docs.map((presence) => {
    //     return {
    //       id: presence.id,
    //       date: moment.tz(presence.date, "Asia/Jakarta").format(),
    //       entryTime: moment.tz(presence.entryTime, "Asia/Jakarta").format(),
    //       exitTime: presence.exitTime
    //         ? moment.tz(presence.exitTime, "Asia/Jakarta").format()
    //         : null,
    //     };
    //   }),
    // };

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs.map((presence) => {
        return {
          id: presence.id,
          date: presence.date,
          entryTime: presence.entryTime,
          exitTime: presence.exitTime,
        };
      }),
    };

    console.log(result.docs);

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Presence not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Presence retrieved successfully",
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

async function getEmployeePresence(req, res) {
  const { id } = req.params;
  try {
    const searchTerm = req.query.date;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["createdAt", "DESC"]];

    const whereClause = { employeeId: id };
    if (searchTerm) {
      whereClause.date = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await presence.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    const response = {
      totalCount: result.total,
      toPl_pages: result.pages,
      data: result.docs.map((presence) => {
        return {
          id: presence.id,
          date: presence.date,
          entryTime: presence.entryTime,
          exitTime: presence.exitTime,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Presence not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Presence retrieved successfully",
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

module.exports = {
  createPresence,
  createQr,
  getPresence,
  getPresenceByUser,
  getEmployeePresence,
};
