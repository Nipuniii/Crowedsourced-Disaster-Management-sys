const express = require("express");
const Comment = require("../models/comment");
const AffectedArea = require("../models/affectedArea");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// User: Add comment to affected area
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { affectedArea, text } = req.body;

    if (!affectedArea || !text) {
      return res.status(400).json({ error: "Affected area and text are required" });
    }

    const area = await AffectedArea.findById(affectedArea);
    if (!area) {
      return res.status(404).json({ error: "Affected area not found" });
    }

    const comment = new Comment({
      affectedArea,
      user: req.user.id,
      text,
    });

    await comment.save();
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
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

module.exports = router;
