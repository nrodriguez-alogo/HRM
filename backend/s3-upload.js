const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

console.log("\n=== AWS CONFIG ON STARTUP ===");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "MISSING");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "SET" : "MISSING");
console.log("AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);
console.log("AWS_S3_REGION:", process.env.AWS_S3_REGION);

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

console.log("S3Client initialized\n");

async function uploadToS3(file) {
  console.log("\n--- uploadToS3 FUNCTION CALLED ---");
  console.log("File details:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  try {
    const key = `${Date.now()}-${file.originalname}`;
    console.log("Generated S3 key:", key);
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read"
    };

    console.log("S3 params:", {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      ACL: params.ACL,
      BodySize: params.Body.length
    });

    console.log("Sending PutObjectCommand to S3...");
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log("S3 response:", result);
    
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    console.log("Generated file URL:", fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error("--- ERROR IN uploadToS3 ---");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.Code);
    console.error("Full error:", error);
    throw error;
  }
}

module.exports = { uploadToS3 };