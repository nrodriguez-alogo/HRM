const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");
const multer = require("multer");
const { uploadToS3 } = require("../s3-upload.js");

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log("File filter - checking file:", file.originalname);
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      console.log("File ACCEPTED");
      cb(null, true);
    } else {
      console.log("File REJECTED - wrong mimetype:", file.mimetype);
      cb(new Error("Only images and PDFs allowed"));
    }
  }
});

router.post("/", upload.single("passport_file"), async (req, res) => {
  try {
    console.log("\n=== PASSPORT ROUTE CALLED ===");
    
    const { horse_id, user_id, passport_expedition_date } = req.body;
    console.log("Request body:", { horse_id, user_id, passport_expedition_date });

    if (!horse_id || !user_id) {
      console.log("ERROR: Missing horse_id or user_id");
      return res.json({ success: false, error: "horse_id and user_id required" });
    }

    console.log("File received?", req.file ? "YES" : "NO");
    
    let filePath = null;
    let fileName = null;

    if (req.file) {
      console.log("Processing file:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer.length
      });

      try {
        console.log("Calling uploadToS3...");
        filePath = await uploadToS3(req.file);
        console.log("uploadToS3 returned:", filePath);
        fileName = req.file.originalname;
        console.log("File saved successfully, path:", filePath);
      } catch (uploadError) {
        console.error("ERROR in uploadToS3:", uploadError.message);
        console.error("Full error:", uploadError);
        throw uploadError;
      }
    } else {
      console.log("NO FILE ATTACHED - saving passport without file");
    }

    console.log("Saving to MongoDB...");
    const db = getDatabase();
    const passportData = {
      horse_id: new ObjectId(horse_id),
      user_id,
      passport_expedition_date,
      file_path: filePath,
      file_name: fileName,
      file_type: req.file?.mimetype || null,
      createdAt: new Date()
    };
    
    console.log("Passport data to save:", passportData);
    const result = await db.collection("passports").insertOne(passportData);
    console.log("MongoDB insert result:", result.insertedId);

    console.log("SUCCESS - Returning response");
    res.json({ success: true, id: result.insertedId, file_path: filePath });
  } catch (error) {
    console.error("\n=== ERROR IN PASSPORT ROUTE ===");
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;