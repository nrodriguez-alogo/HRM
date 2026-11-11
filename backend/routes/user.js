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
      email: email.toLowerCase(),
      userName,
      createdAt: new Date()
    });

    // Link roles that were created for this email before the person had an account
    const linkUpdate = { user_id: uid };
    if (userName) {
      linkUpdate.name = userName;   // use the name from their account
    }

    const linked = await db.collection("roles").updateMany(
      { email: email.toLowerCase(), user_id: null },
      { $set: linkUpdate }
    );

    console.log(`Roles linked to new user: ${linked.modifiedCount}`);

    res.json({ success: true, userId: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// GET /api/user/by-email/:email — find a user by email
router.get("/by-email/:email", async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const db = getDatabase();
    const user = await db.collection("users").findOne({ email });

    if (user) {
      res.json({ success: true, uid: user.uid, email: user.email, userName: user.userName });
    } else {
      res.json({ success: false, error: "User not found" });
    }
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
      res.json({ 
        success: true,
        uid: user.uid,
        email: user.email,
        userName: user.userName,
        fecRegister: user.fecRegister,
        tpNumber: user.tpNumber });
    } else {
      res.json({ success: false, error: "User not found" });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// PUT /api/user/:uid — update user data
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { fecRegister, tpNumber } = req.body;
    
    if (!uid) {
      return res.json({ success: false, error: "uid required" });
    }
    
    const db = getDatabase();
    const result = await db.collection("users").updateOne(
      { uid },
      { $set: { fecRegister, tpNumber } }
    );
    
    if (result.matchedCount === 0) {
      return res.json({ success: false, error: "User not found" });
    }
    
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


module.exports = router;