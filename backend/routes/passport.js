const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb"); 
const { getDatabase } = require("../database.js");

// POST /api/horse-data — save related data
router.post("/", async (req, res) => {
  try {

    const { horse_id, user_id, passport_expedition_date } = req.body;

    if (!horse_id || !user_id) {
      return res.json({ success: false, error: "horse_id and user_id required" });
    }

    const db = getDatabase();
    const result = await db.collection("passports").insertOne({
      horse_id: new ObjectId(horse_id),  // reference to the horse
      user_id,
      passport_expedition_date,
      createdAt: new Date()
    });

    console.log("Insert result:", result);  // ← check after insert
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;