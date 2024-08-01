const { user } = require("../../models/");
const {
  authData,
  generateAccessToken,
  clearToken,
} = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const { validateUser } = require("../validators/validator");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { uploadFileToSpace } = require("../middlewares/multer");

async function signUp(req, res) {
  const { name, email, password, phone, address } = req.body;

  const validation = await validateUser({ email, password });

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newUser = await user.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    const accessToken = generateAccessToken(newUser);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function signIn(req, res) {
  const { email, password } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(existingUser);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
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

    if (req.user && req.user.id && req.user.email) {
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

async function getUser(req, res) {
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

    const result = await user.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(404).json({
        message: "User not found",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
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

async function getDetailUser(req, res) {
  const id = await getIdUser(req);
  try {
    const result = await user.findOne({ where: { id } });
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

async function updateUser(req, res) {
  const id = await getIdUser(req);
  const { name, email, phone, address } = req.body;

  try {
    const existingUser = await user.findOne({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) existingUser.name = name;
    if (email) {
      const existingEmail = await validateUser.validateEmail(email);
      if (existingEmail.error) {
        return res.status(400).json({
          success: false,
          message: existingEmail.error,
        });
      }
      existingUser.email = email;
    }
    if (phone) existingUser.phone = phone;
    if (address) existingUser.address = address;
    if (req.file) {
      const file = req.file;
      const fileName = `avatar-${Date.now()}-${file.originalname}`;
      const fileUrl = await uploadFileToSpace(file.buffer, fileName, "avatars");
      existingUser.avatar = fileUrl;
    }

    await existingUser.save();

    console.log(existingUser);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const existingUser = await user.findOne({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await existingUser.destroy();
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
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
  getUser,
  getDetailUser,
  updateUser,
  deleteUser,
};
