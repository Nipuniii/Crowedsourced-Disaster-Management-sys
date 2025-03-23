const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { 
    address: { type: String, required: true },
    latitude: { 
      type: Number, 
      required: true,
      min: -90, 
      max: 90
    },
    longitude: { 
      type: Number, 
      required: true, 
      min: -180, 
      max: 180
    }
  },
  date: { type: Date, required: true },
  image: { type: String, required: false }, // Optional image URL
  eventType: { 
    type: String, 
    enum: ["volunteer", "aid"], 
    required: true 
  }, // Event type (volunteer or aid)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved"], 
    default: "pending" 
  }
});

module.exports = mongoose.model("Event", EventSchema);
