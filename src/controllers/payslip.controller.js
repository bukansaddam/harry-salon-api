const { payslip, earning, deduction } = require("../../models/");
const { Op, where } = require("sequelize");

async function createPayslip(req, res) {
  const { name, total, employeeId, earnings, deductions } = req.body;

  try {
    const payslipImage = req.file.path;

    const newPayslip = await payslip.create({
      attachment: payslipImage,
      name,
      total,
      employeeId,
    });

    for (let i = 0; i < earnings.length; i++) {
      await earning.create({
        name: earnings[i].name,
        amount: earnings[i].amount,
        payslipId: newPayslip.id,
      });
    }

    for (let i = 0; i < deductions.length; i++) {
      await deduction.create({
        name: deductions[i].name,
        amount: deductions[i].amount,
        payslipId: newPayslip.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payslip created successfully",
      data: newPayslip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

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

async function getDetailPayslip(req, res) {
  const { id } = req.params;
  try {
    const result = await payslip.findOne({
      where: { id },
      include: [{
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
      }],
    });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Payslip retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
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
  getDetailPayslip,
  deletePayslip,
};
