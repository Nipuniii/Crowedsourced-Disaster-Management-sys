const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const Event = require("../models/Event");
const multer = require("multer");
const path = require("path");
const router = express.Router();

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

// User: Create an event (Pending Approval)
router.post("/create", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, location, date, eventType } = req.body;
    console.log("Request Body:", req.body); 
    const image = req.file ? req.file.path : null;
    console.log("Uploaded File:", req.file);

    if (!title || !description || !location || !date || !eventType) {
      return res.status(400).json({ error: "All fields are required" });
    }    

    // Ensure location fields are available
    if (!location.address || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: "Location fields are missing or invalid" });
    }

    const event = new Event({ 
      title, description, 
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      },
      date, eventType, image, 
      createdBy: req.user.id, status: "pending" 
    });
    await event.save();
    res.status(201).json({ message: "Event submitted for approval." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: Approve an event
router.put("/approve/:eventId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.status === "approved") {
      return res.status(400).json({ error: "Event is already approved" });
    }

    event.status = "approved";
    await event.save();

    res.json({ message: "Event approved.", event });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// User: Get pending events
router.get("/pending", async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).populate("createdBy", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// User: Get approved events
router.get("/approved", async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }).populate("createdBy", "name email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get events by type (volunteer or aid)
router.get("/type/:eventType", async (req, res) => {
  try {
    const events = await Event.find({
      status: "approved", 
      eventType: req.params.eventType 
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;