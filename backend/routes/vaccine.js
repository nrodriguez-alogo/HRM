const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");
const multer = require("multer");
const { uploadToS3 } = require("../s3-upload.js");

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs allowed"));
    }
  }
});

router.post("/", upload.array("vaccine_file", 5), async (req, res) => {
  try {
    const { horse_id, user_id, vaccine_date, vaccine_name, vaccine_expiration, batch_number, route, veterinarian_id } = req.body;

    if (!horse_id || !user_id || !vaccine_name) {
      return res.json({ success: false, error: "required fields missing" });
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = await uploadToS3(file, "vaccines");
        files.push({
          path: filePath,
          name: file.originalname,
          type: file.mimetype
        });
      }
    }

    const db = getDatabase();
    const result = await db.collection("vaccines").insertOne({
      horse_id: new ObjectId(horse_id),
      user_id,
      vaccine_date,
      vaccine_name,
      vaccine_expiration,
      batch_number,
      route,
      veterinarian_id: new ObjectId(veterinarian_id),
      files: files,
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;