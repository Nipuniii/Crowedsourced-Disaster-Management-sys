const mongoose = require("mongoose");

const affectedAreaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  image: { type: String, required: false }, 
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Example status
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AffectedArea", affectedAreaSchema);
