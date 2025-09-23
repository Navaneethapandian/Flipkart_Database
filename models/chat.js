const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderRole: { type: String, enum: ["Admin", "User", "DeliveryBoy"], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderRole' }, 
  message: { type: String, required: true },
  profileImage: { type: String }, 
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);
