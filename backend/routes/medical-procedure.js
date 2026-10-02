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

router.post("/", upload.array("procedure_file", 5), async (req, res) => {
  try {
    const { horse_id, user_id, procedure_date, procedure_name, description, veterinarian_id, aftercare, recommendations } = req.body;

    if (!horse_id || !user_id || !procedure_name || !description) {
      return res.json({ success: false, error: "Missing required fields" });
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = await uploadToS3(file, "medical_procedures");
        files.push({
          path: filePath,
          name: file.originalname,
          type: file.mimetype
        });
      }
    }

    const db = getDatabase();
    const result = await db.collection("medical_procedures").insertOne({
      horse_id: new ObjectId(horse_id),
      user_id,
      procedure_date,
      procedure_name,
      description,
      veterinarian_id: new ObjectId(veterinarian_id),
      aftercare,
      recommendations: recommendations || "",
      files: files,
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;