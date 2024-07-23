const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/spaces.config");
const { config } = require("dotenv");
const { de } = require("date-fns/locale");

config();

const dir = "./uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
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

const uploadFileToSpace = async (fileBuffer, fileName, prefix) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: 'images/' + prefix + '/' + fileName,
    Body: fileBuffer,
    ACL: "public-read",
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const location = `https://${params.Bucket}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${params.Key}`;
    return location;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to upload file to space");
  }
};

const deleteFileFromSpace = async (fileName, prefix) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: "images/" + prefix + "/" + fileName,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete file from space");
  }
};

module.exports = { upload, uploadFileToSpace, deleteFileFromSpace };
