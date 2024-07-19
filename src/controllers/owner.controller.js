const { owner } = require("../../models/");
const { Op } = require("sequelize");
const { validateUser } = require("../validators/validator");
const bcrypt = require("bcrypt");
const {
generateAccessToken,
  authData,
  clearToken,
} = require("../middlewares/auth");
const { getIdUser } = require("../Utils/helper");

async function signUp(req, res) {
  const { name, email, password, phone, address } = req.body;

  const validation = await validateUser({ email, password });

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  try {
    const existingOwner = await owner.findOne({ where: { email } });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newOwner = await owner.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    const accessToken = generateAccessToken(newOwner);

    return res.status(200).json({
      success: true,
      message: "Owner created successfully",
      token: accessToken,
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
    const existingOwner = await owner.findOne({ where: { email } });
    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingOwner.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(existingOwner);

    return res.status(200).json({
      success: true,
      message: "Owner logged in successfully",
      token: accessToken,
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

    if (req.owner && req.owner.id && req.owner.email) {
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

async function getOwner(req, res) {
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

    const result = await owner.paginate({
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
        message: "Owner not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Owner retrieved successfully",
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

async function getDetailOwner(req, res) {
  const id = await getIdUser(req);
  try {
    const result = await owner.findOne({ where: { id } });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error for user with id ${id}: ${error.message}`,
    });
  }
}

async function updateOwner(req, res) {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const existingOwner = await owner.findOne({ where: { id } });
    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    if (name) existingOwner.name = name;
    if (email) {
      const existingEmail = await validateUser.validateEmail(email);
      if (existingEmail.error) {
        return res.status(400).json({
          success: false,
          message: existingEmail.error,
        });
      }
      existingOwner.email = email;
    }
    if (phone) existingOwner.phone = phone;
    if (address) existingOwner.address = address;
    if (req.file) existingOwner.avatar = req.file.path;

    await existingOwner.save();

    return res.status(200).json({
      success: true,
      message: "Owner updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteOwner(req, res) {
  const { id } = req.params;
  try {
    const existingOwner = await owner.findOne({ where: { id } });
    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }
    await existingOwner.destroy();
    return res.status(200).json({
      success: true,
      message: "Owner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  signUp,
  signIn,
  signOut,
  getOwner,
  getDetailOwner,
  updateOwner,
  deleteOwner,
};
