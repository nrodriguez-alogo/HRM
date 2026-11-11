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
    // Block duplicates: same person + same role + same horse, still active
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const sameRoleActive = await db.collection("roles").find({
      horse_id: new ObjectId(horse_id),
      role,
      $or: [
        { end_date: null },
        { end_date: { $gt: today } }
      ]
    }).toArray();

    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanName = name.trim().toLowerCase();

    const isDuplicate = sameRoleActive.some(r =>
      (user && r.user_id === user.uid) ||
      (cleanEmail && r.email === cleanEmail) ||
      (!cleanEmail && (r.name || "").trim().toLowerCase() === cleanName)
    );

    if (isDuplicate) {
      return res.json({ success: false, error: `${name.trim()} ya tiene el rol ${role} activo en este caballo` });
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

// PUT /api/role/:id/end — end a role (end date = today)
router.put("/:id/end", async (req, res) => {
  try {
    const roleId = req.params.id;

    if (!ObjectId.isValid(roleId)) {
      return res.json({ success: false, error: "Invalid role ID" });
    }

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const db = getDatabase();
    const result = await db.collection("roles").updateOne(
      { _id: new ObjectId(roleId) },
      { $set: { end_date: today } }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, error: "Role not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;