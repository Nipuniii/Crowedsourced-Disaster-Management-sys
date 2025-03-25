const express = require("express");
const Comment = require("../models/comment");
const AffectedArea = require("../models/affectedArea");
const Event = require("../models/Event")
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// User: Add comment to affected area
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { affectedArea,event, text } = req.body;

    // Only one of affectedArea or event should be required
    if (!text || (!affectedArea && !event)) {
      return res.status(400).json({ error: "Text and either affectedArea or event are required" });
    }

    let area;
    if (affectedArea) {
      area = await AffectedArea.findById(affectedArea);
      if (!area) {
        return res.status(404).json({ error: "Affected area not found" });
      }
    }

    let eventDoc;
    if (event) {
      eventDoc = await Event.findById(event);
      if (!eventDoc) {
        return res.status(404).json({ error: "Event not found" });
      }
    }


    const comment = new Comment({
      affectedArea: area ? affectedArea : undefined,
      event: event ? event : undefined,
      user: req.user.id,
      text,
    });

    await comment.save();
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Error adding comment:", error);  // Log the error to help debug
    res.status(500).json({ error: "Server error" });
  }
});

// Get comments for an affected area
router.get("/:affectedAreaId", async (req, res) => {
  try {
    const comments = await Comment.find({ affectedArea: req.params.affectedAreaId }).populate("user", "name email");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/event/:eventId", async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId }).populate("user", "name email");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
