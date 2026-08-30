const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");

// POST /api/lab-test — save lab test
router.post("/", async (req, res) => {
  try {
    const { horse_id, user_id, test_date, tested_for, test_type, test_result, official_laboratory, veterinarian_id } = req.body;

    if (!horse_id || !user_id || !test_type || !test_result) {
      return res.json({ success: false, error: "Missing required fields" });
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
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;