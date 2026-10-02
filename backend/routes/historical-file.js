const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getDatabase } = require("../database");
const { uploadToS3 } = require("../s3-upload");
const { ObjectId } = require("mongodb");

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// POST - Upload historical file
router.post("/:horseId", upload.single("historical_file"), async (req, res) => {
  try {
    const { horseId } = req.params;

    if (!ObjectId.isValid(horseId)) {
      return res.status(400).json({ message: "Invalid horse ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const db = getDatabase();
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = await uploadToS3(req.file, `historical_files/${horseId}`, fileName);

    await db.collection("horses").updateOne(
      { _id: new ObjectId(horseId) },
      {
        $push: {
          historical_files: {
            file_name: req.file.originalname,
            file_path: filePath,
            file_type: req.file.mimetype,
            uploaded_at: new Date(),
            uploaded_by: req.user?.email || "unknown"
          }
        }
      }
    );

    res.json({ 
      message: "File uploaded successfully",
      file: { file_name: req.file.originalname, file_path: filePath }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Remove historical file
router.delete("/:horseId/:fileIndex", async (req, res) => {
  try {
    const { horseId, fileIndex } = req.params;

    if (!ObjectId.isValid(horseId)) {
      return res.status(400).json({ message: "Invalid horse ID" });
    }

    const db = getDatabase();
    const horse = await db.collection("horses").findOne({ _id: new ObjectId(horseId) });

    if (!horse || !horse.historical_files || !horse.historical_files[fileIndex]) {
      return res.status(404).json({ message: "File not found" });
    }

    await db.collection("horses").updateOne(
      { _id: new ObjectId(horseId) },
      { $unset: { [`historical_files.${fileIndex}`]: 1 } }
    );

    await db.collection("horses").updateOne(
      { _id: new ObjectId(horseId) },
      { $pull: { historical_files: null } }
    );

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;