//express for creating the app
const express = require("express");
const app = express();
const path = require("path");

// Parse JSON bodies: "Read the JSON text data coming in the request body and convert it to JavaScript objects I can use.
app.use(express.json());

// Import database
const { connectDatabase } = require("./database.js");

//Load the horse.js file from the routes folder
const horseRoutes = require("./routes/horse.js");
app.use("/api/horse", horseRoutes);

//Users database
const userRoutes = require("./routes/user.js");
app.use("/api/user", userRoutes);

//Passport database
const passportRoutes = require("./routes/passport.js");
app.use("/api/passport", passportRoutes);

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve uploads and other public files
app.use(express.static(path.join(__dirname, "../public")));

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await connectDatabase();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    process.exit(1);
  }
});