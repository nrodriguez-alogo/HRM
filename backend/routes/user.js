const express = require("express");
const router = express.Router();
const { getDatabase } = require("../database.js");


// POST /api/users — save new user
router.post("/", async (req, res) => {
  try {
    const { uid, email, userName} = req.body;

    if (!uid || !email) {
      return res.json({ success: false, error: "uid and email required" });
    }

    const db = getDatabase();
    const result = await db.collection("users").insertOne({
      uid,
      email,
      userName,
      createdAt: new Date()
    });

    res.json({ success: true, userId: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// GET /api/user/:uid — get user data by uid
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.json({ success: false, error: "uid required" });
    }

    const db = getDatabase();
    const user = await db.collection("users").findOne({ uid });

    if (user) {
      res.json({ success: true, uid: user.uid, email: user.email, userName: user.userName });
    } else {
      res.json({ success: false, error: "User not found" });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


module.exports = router;