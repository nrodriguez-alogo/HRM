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

router.post("/", upload.array("lab_test_file", 5), async (req, res) => {
  try {
    const { horse_id, user_id, test_date, tested_for, test_type, test_result, official_laboratory, veterinarian_id } = req.body;

    if (!horse_id || !user_id || !test_type || !test_result) {
      return res.json({ success: false, error: "Missing required fields" });
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = await uploadToS3(file, "lab_tests");
        files.push({
          path: filePath,
          name: file.originalname,
          type: file.mimetype
        });
      }
    }

    const db = getDatabase();
    const result = await db.collection("lab_tests").insertOne({
      horse_id: new ObjectId(horse_id),
      user_id,
      test_date,
      tested_for,
      test_type,
      test_result,
      official_laboratory,
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