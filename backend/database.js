//require("mongodb") → Load the MongoDB package (you installed it with npm install)
//const { MongoClient } → Extract ONLY the MongoClient part from that package (ignore the rest)
//MongoClient → A class that connects to MongoDB
const { MongoClient } = require("mongodb");


//mongoClient → Will hold the connection object later
//database → Will hold the actual database object later
let mongoClient = null;
let database = null;

// Connect to MongoDB

//async → This function takes time (connecting to MongoDB isn't instant), so we make it async. This lets us use await inside.
async function connectDatabase() {

  try {

    // mongoClient is the variable declared above to hold the connection object
    // New MongoClient created a new connection object, the url is where the Mongo DB is running
    mongoClient = new MongoClient("mongodb://localhost:27017");

    // "Wait here until the connection is made before moving on." Witht¿out this, the code moves on without connecting and could break everything
    await mongoClient.connect();

    // database is the variable delcared above. "Get me the AOG_Database from this MongoDB connection"
    database = mongoClient.db("HALTER_DATABASE");

    console.log("Connected database");
    return database;
  } catch (error) {
    console.log(`ERROR connecting to database: ${error.message}`);
    throw error;
  }
}

// Get the database connection (used by routes and models)
function getDatabase() {
  if (!database) {
    //throw error expression will stop everything, used because the db is mandatory for proper performance
    throw new Error("Database not connected. Call connectDatabase() first.");
  }
  return database;
}

// Close connection when app shuts down
async function closeDatabase() {
  // if there is a connection, then close the connection
  if (mongoClient) {
    await mongoClient.close();
    console.log("✓ Database connection closed");
  }
}

// export function so other files can use them
module.exports = { connectDatabase, getDatabase, closeDatabase };