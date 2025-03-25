const express = require("express");
const AffectedArea = require("../models/affectedArea");
const {authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Store unique filenames
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB size limit for example
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Invalid file type. Only images are allowed."));
    }
    cb(null, true);
  }
});

// Admin: Create Affected Area
router.post("/create", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("Form Data:", req.body);  // Log the form data
    console.log("Uploaded File:", req.file);  // Log the file

    const { title, description, location ,date, eventRadius} = req.body;
    const image = req.file ? req.file.path : null;

    if (!title || !description || !location || !location.address || !location.latitude || !location.longitude, !date, !eventRadius) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const affectedArea = new AffectedArea({
      title,
      description,
      location,
      image,
      date,
      eventRadius,
      createdBy: req.user.id,
    });

    await affectedArea.save();
    res.status(201).json({ message: "Affected area created successfully", affectedArea });
  } catch (error) {
    console.error("Error in event creation:", error); 
    res.status(500).json({ error: "Server error" });
  }
});

// Get all Affected Areas
router.get("/events", async (req, res) => {
  try {
    const affectedAreas = await AffectedArea.find().populate("createdBy", "name email");
    res.json(affectedAreas);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
