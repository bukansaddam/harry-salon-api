const { payslip, earning, deduction, employee } = require("../../models/");
const { Op, where } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { uploadFileToSpace } = require("../middlewares/multer");

const createPayslip = async (req, res) => {
  const { name, total, employeeId, date, earnings, deductions } = req.body;

  try {
    let payslipImage = null;

    if (req.file) {
      if (req.file.length > 1) {
        return res.status(400).json({
          success: false,
          message: "Only one attachment is allowed",
        });
      }

      const file = req.file;
      const fileName = `payslip-${Date.now()}-${file.originalname}`;

      const uploadResult = await uploadFileToSpace(file.buffer, fileName, "payslips");

      payslipImage = uploadResult;
    }

    const userId = await getIdUser(req);

    const parsedEarnings =
      typeof earnings === "string" ? JSON.parse(earnings) : earnings;
    const parsedDeductions =
      typeof deductions === "string" ? JSON.parse(deductions) : deductions;

    if (!Array.isArray(parsedEarnings) || !Array.isArray(parsedDeductions)) {
      return res.status(400).json({
        success: false,
        message: "Earnings and deductions must be arrays",
      });
    }

    const newPayslip = await payslip.create({
      attachment: payslipImage,
      name,
      total,
      employeeId,
      date,
      createdBy: userId,
    });

    console.log("New payslip created:", newPayslip);

    if (parsedEarnings.length > 0) {
      console.log("Processing earnings...");
      for (let i = 0; i < parsedEarnings.length; i++) {
        console.log(`Creating earning ${i}:`, parsedEarnings[i]);
        await earning.create({
          name: parsedEarnings[i].name,
          amount: parsedEarnings[i].amount,
          payslipId: newPayslip.id,
        });
      }
    } else {
      console.log("No earnings to process.");
    }

    if (parsedDeductions.length > 0) {
      console.log("Processing deductions...");
      for (let i = 0; i < parsedDeductions.length; i++) {
        console.log(`Creating deduction ${i}:`, parsedDeductions[i]);
        await deduction.create({
          name: parsedDeductions[i].name,
          amount: parsedDeductions[i].amount,
          payslipId: newPayslip.id,
        });
      }
    } else {
      console.log("No deductions to process.");
    }

    return res.status(200).json({
      success: true,
      message: "Payslip created successfully",
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

async function getPayslip(req, res) {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.employeeId = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await payslip.paginate({
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
        message: "Payslip not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payslip retrieved successfully",
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

async function getPayslipByOwner(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const userId = await getIdUser(req);

    const whereClause = { createdBy: userId };
    if (searchTerm) {
      whereClause.employeeId = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await payslip.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: [
        {
          model: employee,
          attributes: ["avatar", "name"],
        },
      ],
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs.map((payslip) => {
        const avatar = payslip.employee.avatar;
        const employeeName = payslip.employee.name;
        return {
          id: payslip.id,
          avatar: avatar,
          employeeName: employeeName,
          name: payslip.name,
          total: payslip.total,
          createdAt: payslip.date,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Payslip not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payslip retrieved successfully",
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

async function getPayslipByEmployee(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["date", "DESC"]];

    const userId = await getIdUser(req);

    const whereClause = { employeeId: userId };
    if (searchTerm) {
      whereClause.employeeId = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await payslip.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
      include: [
        {
          model: employee,
          attributes: ["avatar", "name"],
        },
      ],
    });

    const response = {
      total_count: result.total,
      total_pages: result.pages,
      data: result.docs.map((payslip) => {
        const avatar = payslip.employee.avatar;
        const employeeName = payslip.employee.name;
        return {
          id: payslip.id,
          avatar: avatar,
          employeeName: employeeName,
          name: payslip.name,
          total: payslip.total,
          createdAt: payslip.date,
        };
      }),
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Payslip not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payslip retrieved successfully",
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

async function getDetailPayslip(req, res) {
  const { id } = req.params;
  try {
    const result = await payslip.findOne({
      where: { id },
      include: [
        {
          model: earning,
          as: "earnings",
          attributes: ["name", "amount"],
          where: { payslipId: id },
        },
        {
          model: deduction,
          as: "deductions",
          attributes: ["name", "amount"],
          where: { payslipId: id },
          required: false,
        },
        {
          model: employee,
          attributes: ["avatar", "name"],
        }
      ],
    });

    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Payslip not found",
      });
    }

    const response = {
      id: result.id,
      avatar: result.employee.avatar,
      employeeName: result.employee.name,
      name: result.name,
      attachment: result.attachment,
      total: result.total,
      date: result.date,
      employeeId: result.employeeId,
      createdBy: result.createdBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      earnings: result.earnings,
      deductions: result.deductions,
    };

    return res.status(200).json({
      success: true,
      message: "Payslip retrieved successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/*
async function updatePayslip(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const existingPayslip = await payslip.findOne({ where: { id } });
    if (!existingPayslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    if (name) existingPayslip.name = name;
    if (description) existingPayslip.description = description;
    if (req.file) existingPayslip.image = req.file.path;

    await existingPayslip.save();

    return res.status(200).json({
      success: true,
      message: "Payslip updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
*/

async function deletePayslip(req, res) {
  const { id } = req.params;
  try {
    const existingPayslip = await payslip.findOne({ where: { id } });
    if (!existingPayslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }
    await existingPayslip.destroy();
    return res.status(200).json({
      success: true,
      message: "Payslip deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createPayslip,
  getPayslip,
  getPayslipByOwner,
  getPayslipByEmployee,
  getDetailPayslip,
  deletePayslip,
};
