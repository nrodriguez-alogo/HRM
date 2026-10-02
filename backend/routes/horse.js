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
router.post("/", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "photo_front", maxCount: 1 },
  { name: "photo_left", maxCount: 1 },
  { name: "photo_right", maxCount: 1 },
  { name: "photo_behind", maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, name, date_of_birth, roles, country_of_birth, breeding_place, sex, color, breed, father, mother, mothers_father, head_description, lf_description, rf_description, lh_description, rh_description, body_description } = req.body;

    if (!user_id || !name) {
      return res.json({ success: false, error: "user_id and name required" });
    }

    // Get image paths
    let imagePath = null;
    let photoFront = null;
    let photoLeft = null;
    let photoRight = null;
    let photoBehind = null;

    if (req.files.image) {
      imagePath = "uploads/" + req.files.image[0].filename;
    }
    if (req.files.photo_front) {
      photoFront = "uploads/" + req.files.photo_front[0].filename;
    }
    if (req.files.photo_left) {
      photoLeft = "uploads/" + req.files.photo_left[0].filename;
    }
    if (req.files.photo_right) {
      photoRight = "uploads/" + req.files.photo_right[0].filename;
    }
    if (req.files.photo_behind) {
      photoBehind = "uploads/" + req.files.photo_behind[0].filename;
    }

    const db = getDatabase();
    const result = await db.collection("horses").insertOne({
      user_id,
      name,
      date_of_birth,
      roles: Array.isArray(roles) ? roles : roles ? [roles] : [],
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
      photo_front: photoFront,
      photo_left: photoLeft,
      photo_right: photoRight,
      photo_behind: photoBehind,
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
      {
  $lookup: {
    from: "medical_procedures",
    localField: "_id",
    foreignField: "horse_id",
    as: "medical_procedures"
  }
},
{
  $lookup: {
    from: "veterinarians",
    localField: "medical_procedures.veterinarian_id",
    foreignField: "_id",
    as: "procedure_vets"
  }
},
{
  $addFields: {
    medical_procedures: {
      $map: {
        input: "$medical_procedures",
        as: "procedure",
        in: {
          $mergeObjects: [
            "$$procedure",
            {
              vet_name: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$procedure_vets",
                      as: "vet",
                      cond: { $eq: ["$$vet._id", "$$procedure.veterinarian_id"] }
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
    $project: { 
      vets: 0, 
      lab_vets: 0, 
      hauling_vets: 0, 
      procedure_vets: 0,
      "historical_files.uploaded_by": 0  // Optional: hide uploader info in response
    } 
  },
      { $project: { vets: 0, lab_vets: 0, hauling_vets: 0, procedure_vets: 0  } }
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