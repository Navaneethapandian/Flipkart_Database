const config = require('../config/db');
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/deliveryBoy");
const Order = require("../models/order");
const path = require('path');
const {sendEmail} = require("../config/email");

// 🔹 Register DeliveryBoy
const deliveryBoyRegister = async (req, res) => {
  try {
    const {
      username,
      email,
      phoneNumber,
      password,
      vehicleType,
      vehicleNumber,
      role,
      status,
      deliveryArea,
      assignedOrders,
    } = req.body;

    const profileImage = req.file ? path.resolve(req.file.path) : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDeliveryBoy = new DeliveryBoy({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      vehicleType,
      vehicleNumber,
      role,
      status,
      deliveryArea,
      assignedOrders,
      profileImage,
    });

    await newDeliveryBoy.save();
    sendEmail(newDeliveryBoy.email,'Account Created!', "WELCOME TO FLIPCART CLONE" ,`Hi ${newDeliveryBoy.username}.Your Email: ${newDeliveryBoy.email} and Your Password: ${password}`);
    res.status(201).json({
      message: "Delivery boy registered successfully",
      deliveryBoy: newDeliveryBoy,
    });
  } catch (error) {
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

    const token = jwt.sign(
      { id: deliveryBoy._id, role: deliveryBoy.role },
      config.jwtSecret, { expiresIn: "30d" }
    );
    sendEmail(deliveryBoy.email,'Login Successful!');
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Update DeliveryBoy
const updateDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const updates = req.body;
    let profileImage = req.body.profileImage;
    if (req.file && req.file.filename) {
      profileImage = req.file.filename;
    }
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    Object.keys(updates).forEach(key => deliveryBoy[key] = updates[key]);

    const updatedDeliveryBoy = await deliveryBoy.save();
    res.status(200).json({ message: "Delivery boy updated successfully", deliveryBoy: updatedDeliveryBoy });
  } catch (error) {
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
    await sendEmail(
      email,
      "Your Delivery App OTP",
      `Hi ${deliveryBoy.username},\n\nYour OTP is: ${otp}\n\nPlease use this to verify your account.`
    );
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    if (deliveryBoy.otp !== otp) return res.status(401).json({ error: "Invalid OTP" });

    deliveryBoy.otp = null;
    await deliveryBoy.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    deliveryBoy.password = hashedPassword;
    await deliveryBoy.save();
    await sendEmail(
      email,
      "Password Reset Successful",
      `Hi ${deliveryBoy.username},\n\nYour password has been successfully reset.`
    );
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
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
    await sendEmail(
      deliveryBoy.email,
      "Password Changed",
      `Hi ${deliveryBoy.username},\n\nYour password has been successfully changed.`
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 View Assigned Orders

const getAssignedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;

    // match the field name in Order schema
    const orders = await Order.find({ deliveryBoysId: deliveryBoyId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders assigned yet" });
    }

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewAssignedOrders = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).populate("assignedOrders");
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    res.status(200).json({ assignedOrders: deliveryBoy.assignedOrders });
  } catch (error) {
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
    await sendEmail(
      "admin@deliveryapp.com",
      "Order Status Updated",
      `Delivery boy ${deliveryBoy.username} updated order ${orderId} status to ${status}.`
    );

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const deliveryBoyId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery boy not found" });

    res.status(200).json({ deliveryBoy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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
    res.status(500).json({ error: error.message });
  }
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
};