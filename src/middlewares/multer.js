const multer = require("multer");
const fs = require("fs");
const path = require("path");

const dir = "./uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["jpg", "jpeg", "png"];
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      const error = new Error("Only JPG and PNG files are allowed");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = new Error("File size exceeds the limit (2MB)");
      error.code = "LIMIT_FILE_SIZE";
      return cb(error, false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
