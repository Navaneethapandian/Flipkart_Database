const config = require('../config/db');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/deliveryBoy");
const Order = require("../models/order");
const path = require('path');
const Chat = require("../models/chat");
const { sendEmail } = require("../config/email");

// 🔹 Register DeliveryBoy
const deliveryBoyRegister = async (req, res) => {
  try {
    const {
      username, email, phoneNumber, password,
      vehicleType, vehicleNumber, role, status,
      deliveryArea, assignedOrders,
    } = req.body;

    const profileImage = req.file ? path.resolve(req.file.path) : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDeliveryBoy = new DeliveryBoy({
      username, email, phoneNumber, password: hashedPassword,
      vehicleType, vehicleNumber, role, status,
      deliveryArea, assignedOrders, profileImage,
    });

    await newDeliveryBoy.save();

    await sendEmail(
      newDeliveryBoy.email,
      'Account Created!',
      `Hi ${newDeliveryBoy.username},\nYour Email: ${newDeliveryBoy.email}\nPassword: ${password}`
    );

    res.status(201).json({ message: "Delivery boy registered successfully", deliveryBoy: newDeliveryBoy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Login
const deliveryBoyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: deliveryBoy._id, role: deliveryBoy.role }, config.jwtSecret, { expiresIn: "30d" });
    await sendEmail(deliveryBoy.email, 'Login Successful', `Hi ${deliveryBoy.username}, you logged in successfully.`);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Update DeliveryBoy
const updateDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const updates = req.body;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    Object.keys(updates).forEach(key => deliveryBoy[key] = updates[key]);
    if (req.file && req.file.path) deliveryBoy.profileImage = path.resolve(req.file.path);

    await deliveryBoy.save();
    res.status(200).json({ message: "Delivery boy updated successfully", deliveryBoy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Delete DeliveryBoy
const deleteDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    await deliveryBoy.deleteOne();
    res.status(200).json({ message: "Delivery boy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    deliveryBoy.otp = otp;
    await deliveryBoy.save();

    await sendEmail(email, "Your OTP", `Hi ${deliveryBoy.username}, Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    if (deliveryBoy.otp != otp) return res.status(401).json({ error: "Invalid OTP" });

    deliveryBoy.otp = null;
    await deliveryBoy.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    deliveryBoy.password = await bcrypt.hash(newPassword, 10);
    await deliveryBoy.save();
    await sendEmail(email, "Password Reset", `Hi ${deliveryBoy.username}, your password has been reset.`);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Change Password
const changePassword = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const { oldPassword, newPassword } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const isMatch = await bcrypt.compare(oldPassword, deliveryBoy.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    deliveryBoy.password = await bcrypt.hash(newPassword, 10);
    await deliveryBoy.save();
    await sendEmail(deliveryBoy.email, "Password Changed", `Hi ${deliveryBoy.username}, your password has been changed.`);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get Assigned Orders
const getAssignedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const orders = await Order.find({ deliveryBoysId: deliveryBoyId });
    if (!orders || orders.length === 0) return res.status(404).json({ message: "No orders assigned yet" });

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 View Assigned Orders (with populate)
const viewAssignedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).populate("assignedOrders");
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    res.status(200).json({ assignedOrders: deliveryBoy.assignedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const { orderId, status } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).populate("assignedOrders");
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const order = deliveryBoy.assignedOrders.id(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await deliveryBoy.save();
    await sendEmail("admin@deliveryapp.com", "Order Status Updated", `Delivery boy ${deliveryBoy.username} updated order ${orderId} status to ${status}.`);

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get Profile
const getProfile = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    res.status(200).json({ deliveryBoy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Update Profile
const updateDeliveryBoyProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const { username, email, phoneNumber } = req.body;
    deliveryBoy.username = username || deliveryBoy.username;
    deliveryBoy.email = email || deliveryBoy.email;
    deliveryBoy.phoneNumber = phoneNumber || deliveryBoy.phoneNumber;

    await deliveryBoy.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const handleDeliveryBoyMessage = async ({ io, senderId, role, message, profileImage = "", meta = {}, res }) => {
  try {
    if (!message) {
      if (res) return res.status(400).json({ error: "Message is required" });
      return;
    }
    const chat = await Chat.create({ senderRole: role, senderId, message, profileImage, meta });
    console.log("-------chat",chat)
    const chatData = {
      id: chat._id,
      role,
      senderId,
      message: chat.message,
      profileImage: chat.profileImage,
      timestamp: chat.timestamp || chat.createdAt
    };
    console.log("----chatData",chatData)

    if (io) io.emit("chat message", chatData);
    if (res) return res.status(201).json({ success: true, message: chatData });
  } catch (err) {
    console.error(`${role} message error:`, err);
    if (res) return res.status(500).json({ error: err.message });
  }
};

const sendDeliveryBoyMessage = async (req, res) => {
  try {
    const message = req.body.message || ""; 
    const senderId = req.user.id;           
    const profileImage = req.file ? req.file.path : req.user.profileImage || "";
    const chat = await Chat.create({
      senderId: senderId,      
      senderRole: "DeliveryBoy",
      message: message,
      profileImage: profileImage
    });
    console.log("-------------profileImage",profileImage);

    res.status(201).json({  chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Get All Chats
const getAllDeliveryBoyChats = async (req, res) => {
  try {
    const id = req.query.deliveryBoyId || req.body.deliveryBoyId || req.user.id;
    if (!id) return res.status(400).json({ error: "deliveryBoyId is required" });

    const chats = await Chat.find({ $or: [{ senderId: id }, { receiverId: id }] }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, count: chats.length, messages: chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDeliveryBoyChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const DeliveryBoySocketHandler = async (io, data) => {
  const { senderId, message, meta } = data;
  if (!message) return;
  const chat = await Chat.create({ senderRole: "DeliveryBoy", senderId, message, meta });
  io.emit("chat message", chat);
  return chat;
};

module.exports = {
  deliveryBoyRegister,
  deliveryBoyLogin,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  sendOTP,
  verifyOtp,
  forgetPassword,
  changePassword,
  getAssignedOrders,
  viewAssignedOrders,
  updateOrderStatus,
  getProfile,
  updateDeliveryBoyProfile,
  handleDeliveryBoyMessage,
  deleteDeliveryBoyChat,
  sendDeliveryBoyMessage,
  getAllDeliveryBoyChats,
  DeliveryBoySocketHandler
};
