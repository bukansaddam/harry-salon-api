const { employee, store } = require("../../models/");
const { Op } = require("sequelize");
const { validateUser } = require("../validators/validator");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  authData,
  clearToken,
  isOwner,
} = require("../middlewares/auth");
const { getIdUser } = require("../Utils/helper");

async function createEmployee(req, res) {
  const { name, email, password, phone, address, storeId } = req.body;

  const validation = await validateUser({ email, password });

  const userId = await getIdUser(req);

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error.message });
  }

  try {
    const existingEmployee = await employee.findOne({ where: { email } });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const newEmployee = await employee.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      storeId,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function signIn(req, res) {
  const { email, password } = req.body;

  try {
    const existingEmployee = await employee.findOne({ where: { email } });
    if (!existingEmployee) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingEmployee.password
    );
    if (!isPasswordValid) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(existingEmployee);

    const storeId = existingEmployee.storeId;

    return res.status(200).json({
      success: true,
      message: "Employee logged in successfully",
      token: accessToken,
      storeId: storeId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function signOut(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token || authData.blacklistedTokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.employee && req.employee.id && req.employee.email) {
      clearToken(token);
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function getEmployee(req, res) {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = {};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await employee.paginate({
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
      return res.status(200).json({
        success: false,
        message: "Employee not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
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

async function getEmployeeByOwner(req, res) {
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    let order = [["name", "ASC"]];

    const whereClause = {createdBy: userId};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await employee.paginate({
      attributes: ["id", "name", "avatar", "storeId"],
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
      return res.status(200).json({
        success: false,
        message: "Employee not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
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

async function getEmployeeByStore(req, res) {
  const { storeId } = req.params;
  try {
    const searchTerm = req.query.name;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = { storeId: storeId};
    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };

      order = [];
    }

    const result = await employee.paginate({
      attributes: ["id", "name", "avatar", "storeId"],
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
      return res.status(200).json({
        success: false,
        message: "Employee not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
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

async function getDetailEmployee(req, res) {
  const id = await getIdUser(req);
  try {
    const result = await employee.findOne({ where: { id } });

    const storeLocation = await store.findOne({
      where: { id: result.storeId },
      attributes: ["location"],
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: {
        ...result.toJSON(),
        storeLocation: storeLocation ? storeLocation.location : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, email, phone, address, storeId } = req.body;

  try {
    const existingEmployee = await employee.findOne({ where: { id } });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (name) existingEmployee.name = name;
    if (email) {
      const existingEmail = await validateUser.validateEmail(email);
      if (existingEmail.error) {
        return res.status(400).json({
          success: false,
          message: existingEmail.error,
        });
      }
      existingEmployee.email = email;
    }
    if (phone) existingEmployee.phone = phone;
    if (address) existingEmployee.address = address;
    if (req.file) existingEmployee.avatar = req.file.path;
    if (storeId) existingEmployee.storeId = storeId;

    await existingEmployee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteEmployee(req, res) {
  const { id } = req.params;
  try {
    const existingEmployee = await employee.findOne({ where: { id } });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    await existingEmployee.destroy();
    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createEmployee,
  signIn,
  signOut,
  getEmployee,
  getEmployeeByOwner,
  getEmployeeByStore,
  getDetailEmployee,
  updateEmployee,
  deleteEmployee,
};
