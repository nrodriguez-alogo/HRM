const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");

// POST /api/vaccine — save vaccine
router.post("/", async (req, res) => {
  try {
    const { horse_id, user_id, vaccine_date, vaccine_name, vaccine_expiration, batch_number, route, veterinarian_id } = req.body;

    if (!horse_id || !user_id || !vaccine_name) {
      return res.json({ success: false, error: "horse_id, user_id, and vaccine_name required" });
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
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;