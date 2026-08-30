//required to handle HTTP requests
const express = require("express");

//A router is a container for related routes (endpoints).
const router = express.Router();

//Import database connection
const { getDatabase } = require("../database.js");

//Import horse class
const Horse = require("../models/Horse.js");

//Image handling
const multer = require("multer");
const path = require("path");

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });



/* //Route handler: listen for POST requests, add is the endpoint path, req is the request and res is the result
 router.post("/add", async (req, res) => {
  try {
    //Getting data user input in form
    const name = req.body.name;
    const chipNumber = req.body.chip_number;
    
    //create new object (new row in the database)
    const horse = new Horse(name, chip_number);
    //validating data with method previously defined in aircraft class
    horse.validate();
    
    //getting the database connection to mongo db
    const db = getDatabase();
    //saving the data
    const result = await db.collection("horses").insertOne(horse);
    
    //tell the frontend it worked
    res.json({success: true, id: result.insertedId});
  } catch (error) { //telling the front end it didn't work
    res.json({success: false, error: error.message});
  }
}); */


router.get("/", async (req, res) => {
  try {
    const user_id = req.query.user_id; 
    const db = getDatabase();
    const horses = await db.collection("horses").find({ user_id }).toArray();
    res.json(horses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /api/horse — save horse data (without image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("req.file:", req.file);  // ← add this
    console.log("req.body:", req.body);  // ← add this
    const { user_id, name, date_of_birth, chip_number, fec_register, roles, country_of_birth, breeding_place, sex, color, breed, father, mother, mothers_father, head_description, lf_description, rf_description, lh_description, rh_description, body_description } = req.body;

    if (!user_id || !name) {
      return res.json({ success: false, error: "user_id and name required" });
    }

    // Image path if file was uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/" + req.file.filename;
    }

    const db = getDatabase();
    const result = await db.collection("horses").insertOne({
      user_id,
      name,
      date_of_birth,
      fec_register,
      chip_number,
      roles: roles || [],
      country_of_birth,
      breeding_place,
      sex,
      color,
      breed,
      father,
      mother,
      mothers_father,
      head_description,
      lf_description,
      rf_description,
      lh_description,
      rh_description,
      body_description,
      imagePath,
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


// GET /api/horse/:id — get single horse
router.get("/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const horseId = req.params.id;

    if (!ObjectId.isValid(horseId)) {
      return res.status(400).json({ message: "Invalid horse ID" });
    }

    const db = getDatabase();
    
    const horse = await db.collection("horses").aggregate([
      {
        $match: { _id: new ObjectId(horseId) }
      },
      {
        $lookup: {
          from: "passports",
          localField: "_id",
          foreignField: "horse_id",
          as: "passport"
        }
      },
      {
        $lookup: {
          from: "vaccines",
          localField: "_id",
          foreignField: "horse_id",
          as: "vaccines"
        }
      },
      {
        $lookup: {
          from: "veterinarians",
          localField: "vaccines.veterinarian_id",
          foreignField: "_id",
          as: "vets"
        }
      },
      {
        $addFields: {
          vaccines: {
            $map: {
              input: "$vaccines",
              as: "vaccine",
              in: {
                $mergeObjects: [
                  "$$vaccine",
                  {
                    vet_name: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$vets",
                            as: "vet",
                            cond: { $eq: ["$$vet._id", "$$vaccine.veterinarian_id"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "lab_tests",
          localField: "_id",
          foreignField: "horse_id",
          as: "lab_tests"
        }
      },
      {
        $lookup: {
          from: "veterinarians",
          localField: "lab_tests.veterinarian_id",
          foreignField: "_id",
          as: "lab_vets"
        }
      },
      {
        $addFields: {
          lab_tests: {
            $map: {
              input: "$lab_tests",
              as: "test",
              in: {
                $mergeObjects: [
                  "$$test",
                  {
                    vet_name: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$lab_vets",
                            as: "vet",
                            cond: { $eq: ["$$vet._id", "$$test.veterinarian_id"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "haulings",
          localField: "_id",
          foreignField: "horse_id",
          as: "haulings"
        }
      },
      {
        $lookup: {
          from: "veterinarians",
          localField: "haulings.veterinarian_id",
          foreignField: "_id",
          as: "hauling_vets"
        }
      },
      {
        $addFields: {
          haulings: {
            $map: {
              input: "$haulings",
              as: "hauling",
              in: {
                $mergeObjects: [
                  "$$hauling",
                  {
                    vet_name: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$hauling_vets",
                            as: "vet",
                            cond: { $eq: ["$$vet._id", "$$hauling.veterinarian_id"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $project: { vets: 0, lab_vets: 0, hauling_vets: 0 } }
    ]).toArray();

    if (!horse || horse.length === 0) {
      return res.status(404).json({ message: "Horse not found" });
    }

    res.json(horse[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Making router available to other files
module.exports = router;