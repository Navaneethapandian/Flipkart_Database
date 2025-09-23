const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  address: { type: String, required: true },
  paymentMethods: { type: String, enum: ["gpay", "cash"], required: true },
  profileImage: { type:String },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      stock: { type: Number, default: 1 }
    }
  ],
  chat: [
          {
              senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
              receiverId: { type: mongoose.Schema.Types.ObjectId }, 
              message: { type: String, required: true },
              profileImage: { type: String, default: "" }, 
              timestamp: { type: Date, default: Date.now }
          }
      ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
