const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.fieldname + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs only
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs allowed"));
    }
  }
});

// POST /api/passport — save passport with optional file
router.post("/", upload.single("passport_file"), async (req, res) => {
  try {
    const { horse_id, user_id, passport_expedition_date } = req.body;

    if (!horse_id || !user_id) {
      return res.json({ success: false, error: "horse_id and user_id required" });
    }

    // Get file path if uploaded
    let filePath = null;
    if (req.file) {
      filePath = "uploads/" + req.file.filename;
    }

    const db = getDatabase();
    const result = await db.collection("passports").insertOne({
      horse_id: new ObjectId(horse_id),
      user_id,
      passport_expedition_date,
      file_path: filePath,  // ← new field
      file_name: req.file?.originalname || null,  // ← original file name
      file_type: req.file?.mimetype || null,  // ← file type (image/pdf)
      createdAt: new Date()
    });

    console.log("Passport saved with file:", filePath);
    res.json({ success: true, id: result.insertedId, file_path: filePath });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;