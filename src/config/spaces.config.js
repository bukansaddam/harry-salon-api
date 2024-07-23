const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { config } = require("dotenv");

config();

const s3Client = new S3Client({
  region: process.env.SPACES_REGION,
  endpoint: process.env.SPACES_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
});

module.exports = s3Client;
