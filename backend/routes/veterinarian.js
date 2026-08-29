const express = require("express");
const router = express.Router();
const { getDatabase } = require("../database.js");

// POST /api/veterinarian — save vet
router.post("/", async (req, res) => {
  try {
    const { name, professional_license_id } = req.body;

    if ( !name || !professional_license_id) {
      return res.json({ success: false, error: "name, and professional_license_id required" });
    }

    const db = getDatabase();
    const result = await db.collection("veterinarians").insertOne({
      name,
      professional_license_id,
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// GET /api/veterinarian — get all vets
router.get("/", async (req, res) => {
  try {
    const db = getDatabase();
    const vets = await db.collection("veterinarians").find({}).toArray();  // ← no filter
    
    res.json(vets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;