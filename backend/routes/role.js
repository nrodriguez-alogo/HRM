const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database.js");

// POST /api/role — assign a role on a horse (with or without a user account)
router.post("/", async (req, res) => {
  try {
    const { email, name, horse_id, role, start_date, end_date, created_by } = req.body;

    if (!name || !horse_id || !role || !start_date) {
      return res.json({ success: false, error: "name, horse_id, role and start_date required" });
    }

    if (!ObjectId.isValid(horse_id)) {
      return res.json({ success: false, error: "Invalid horse ID" });
    }

    if (end_date && end_date < start_date) {
      return res.json({ success: false, error: "La fecha de fin no puede ser anterior a la fecha de inicio" });
    }

    const db = getDatabase();

    // If an email was given, look for an existing account
    let user = null;
    if (email) {
      user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
    }

    const result = await db.collection("roles").insertOne({
      user_id: user ? user.uid : null,     // null = person has no account (yet)
      email: email ? email.trim().toLowerCase() : "",   // saved even without an account, to link later
      name: name.trim(),
      horse_id: new ObjectId(horse_id),
      role,
      start_date,
      end_date: end_date || null,          // null = role is still active
      created_by,                          // uid of who assigned the role
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;