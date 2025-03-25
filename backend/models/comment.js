const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  affectedArea: { type: mongoose.Schema.Types.ObjectId, ref: "AffectedArea", default: null },  // Ensure null default is set
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null }, // Ensure null default is set
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
