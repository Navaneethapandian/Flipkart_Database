const Admin = require("../models/Admin");
const User = require("../models/user");
const DeliveryBoy = require("../models/deliveryBoy");
const Order = require("../models/order");
const Product = require("../models/product");
const config = require('../config/db');
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const path = require('path');
const {sendEmail}=require('../config/email');
const Chat = require("../models/chat");

const registerAdmin = async (req, res) => {
  try {
    const { username, email, phoneNumber, password, role, status } = req.body;
    const profileImage = req.file ? path.resolve(req.file.path) : null;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, phoneNumber, password: hashedPassword, role, status , profileImage });
    await newAdmin.save();
    sendEmail(newAdmin.email,'Account Created!',`Hi ${newAdmin.username}.Your Email: ${newAdmin.email} and Your Password: ${password}`);
    res.status(201).json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: admin._id, role: 'admin' }, config.jwtSecret, { expiresIn: "30d" });
    sendEmail(admin.email,'Login Successful!');
    res.status(200).json({ admin, token });
  } catch (err) {
    console.error(err.message); 
    res.status(500).send("Server error");
  }
};

// -------------------- ADMIN CRUD --------------------

const UpdateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, email, phoneNumber, password, role, status } = req.body;
    let profileImage = req.body.profileImage;
    if (req.file && req.file.filename) {
      profileImage = req.file.filename;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (username) admin.username = username;
    if (email) admin.email = email;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (password) admin.password = await bcrypt.hash(password, 10);
    if (role) admin.role = role;
    if (status) admin.status = status;
    if (profileImage) admin.profileImage = profileImage;

    const updatedAdmin = await admin.save();
    sendEmail(updatedAdmin.email,"Profile Updated","Your admin profile has been updated successfully!");
    res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin profile", admin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    await admin.deleteOne();
    sendEmail(admin.email,"Account Deleted","Your admin account has been deleted.");
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- PRODUCT CRUD --------------------

const addProduct = async (req, res) => {
  try {
    const { productId , title, description, price, stock, brand, ratings, status } = req.body;
    const newProduct = new Product({
      productId,
      title,
      description,
      price,
      stock,
      brand,
      ratings,
      status
    });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    Object.assign(product, updates);
    const updatedProduct = await product.save();
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const { stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.stock = stock;
    await product.save();
    res.status(200).json({ message: "Product stock updated", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- USER CRUD --------------------

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    Object.assign(user, updates);
    await user.save();
    sendEmail(user.email,"Profile Updated","Your user profile has been updated successfully.");

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.deleteOne();
    sendEmail(user.email,"Account Deleted","Your account has been deleted.");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- DELIVERY BOY CRUD --------------------

const updateDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoysId = req.params.id;
    const updates = req.body;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoysId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery Boy not found" });

    Object.assign(deliveryBoy, updates);
    await deliveryBoy.save();
    sendEmail(deliveryBoy.email,"Profile Updated","Your delivery boy profile has been updated.");
    res.status(200).json({ message: "Delivery Boy updated successfully", deliveryBoy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoysId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoysId);
    if (!deliveryBoy) return res.status(404).json({ error: "Delivery Boy not found" });

    await deliveryBoy.deleteOne();
    
    sendEmail(deliveryBoy.email,"Account Deleted","Your delivery boy account has been deleted.");
    res.status(200).json({ message: "Delivery Boy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- ORDER CRUD --------------------

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- VIEWS / REPORTS --------------------

const viewAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('');
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find();
    res.status(200).json({ deliveryBoys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId')
      .populate('products.productId')
      .populate('deliveryBoysId');
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------- REPORTS --------------------

const getUserReports = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const blockedUsers = await User.countDocuments({ status: 'inactive' });
    res.json({ totalUsers, activeUsers, blockedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductReports = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ stock: { $eq: 0 } });
    res.json({ totalProducts, inStock, outOfStock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderReports = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'pending' });
    const shipped = await Order.countDocuments({ status: 'shipped' });
    const delivered = await Order.countDocuments({ status: 'delivered' });
    const cancelled = await Order.countDocuments({ status: 'cancelled' });
    res.json({ totalOrders, pending, shipped, delivered, cancelled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRevenueReports = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    res.json({ deliveredOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignOrder = async (req, res) => {
  try {
    const { orderId, deliveryBoysId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoysId);
    if (!deliveryBoy)
       return res.status(404).json({ error: "Delivery boy not found" });
       order.deliveryBoysId = deliveryBoysId;
       order.status = "Assigned";
       await order.save();
    if (!deliveryBoy.assignedOrders.includes(orderId)) {
      deliveryBoy.assignedOrders.push(orderId);
    }
    await deliveryBoy.save();
      
    sendEmail(deliveryBoy.email,"New Order Assigned",`You have been assigned to deliver order ${orderId}.`);

    res.status(200).json({ message: "Order assigned successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const handleAdminMessage = async ({ io, senderId, message, meta = {}, res }) => {
  try {
    if (!message) {
      if (res) return res.status(400).json({ error: "Message is required" });
      return;
    }

    const chat = await Chat.create({
      senderRole: "Admin",
      senderId,
      message,
      meta
    });

    const chatData = {
      id: chat._id,
      role: "Admin",         // or dynamic role
      senderId,
      message: chat.message,
      profileImage: chat.profileImage || "",  // add this line
      timestamp: chat.timestamp || chat.createdAt
    };

    if (io) {
      io.emit("chat message", chatData);
    }

    if (res) {
      return res.status(201).json({ success: true, message: chatData });
    }
  } catch (err) {
    console.error("Admin message error:", err);
    if (res) {
      return res.status(500).json({ error: err.message });
    }
  }
};

const sendAdminMessage = async (req, res) => {
  const adminId = req.user && (req.user.userId || req.user.id);
  const { message } = req.body;

  return handleAdminMessage({
    io: req.io,
    senderId: adminId,
    message,
    res
  });
};

const getAllAdminChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ timestamp: 1 })
      .populate('senderId', 'name profileImage');
    res.status(200).json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAdminChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const adminSocketHandler = async (io, data, socket) => {
  const { senderId, message, meta } = data;
  return handleAdminMessage({ io, senderId, message, meta });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  UpdateAdmin,
  getAdminProfile,
  deleteAdmin,
  addProduct,
  updateProduct,
  productStock,
  deleteProduct,
  updateUser,
  deleteUser,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  deleteOrder,
  viewAllProducts,
  viewAllUsers,
  viewAllDeliveryBoys,
  viewAllOrders,
  getUserReports,
  getProductReports,
  getOrderReports,
  getRevenueReports,
  assignOrder,
  adminSocketHandler,
  sendAdminMessage,
  adminSocketHandler,  
  getAllAdminChats,
  deleteAdminChat,
  handleAdminMessage,
};

