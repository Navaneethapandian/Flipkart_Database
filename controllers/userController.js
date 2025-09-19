const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const DeliveryBoy = require('../models/deliveryBoy');
const config = require('../config/db');
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../config/email");   // import mail helper

// ================== AUTH ==================
const registerUser = async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;
    const profileImage=req.file.filename;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, phoneNumber, password: hashedPassword  ,profileImage});
    await newUser.save();

    // Email Notification
    await sendEmail(email, "Welcome to Flipkart Clone", `Hello ${username}, your account has been created successfully!`);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: 'user' }, config.jwtSecret, { expiresIn: "30d" });

    // Email Notification
    await sendEmail(email, "Login Successful", `Hi ${user.username}, you have logged in successfully!`);

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// ================== OTP / PASSWORD ==================
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();

    // Email Notification
    await sendEmail(email, "Your OTP Code", `Your OTP for verification is ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    user.otp = null;
    await user.save();

    // Email Notification
    await sendEmail(email, "OTP Verified", "Your OTP has been successfully verified!");

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Email Notification
    await sendEmail(email, "Password Reset Successful", "Your password has been updated successfully.");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Email Notification
    await sendEmail(email, "Password Changed", "Your password has been successfully changed.");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================== ORDER ==================
const addOrders = async (req, res) => {
  try {
    const { userId, products, totalAmount, address, status, paymentStatus, orderDate, deliveryDate } = req.body;

    const newOrder = new Order({
      userId,
      products: products.map(p => ({
        productId: p.productId,
        stock: parseInt(p.stock, 10)
      })),
      totalAmount,
      address,
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null
    });

    await newOrder.save();

    const user = await User.findById(userId);

    // Email Notification
    await sendEmail(user.email, "Order Placed", `Your order has been placed successfully. Order ID: ${newOrder._id}`);

    res.status(201).json({ message: "Order added successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================== CART ==================
const addtoCart = async (req, res) => {
  try {
    const userId = req.params.id;
    let { productId, stock } = req.body;
    stock = parseInt(stock, 10);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingProduct = user.cart.find(item => item.productId.toString() === productId);
    if (existingProduct) {
      existingProduct.stock += stock;
    } else {
      user.cart.push({ productId, stock });
    }
    await user.save();
    await sendEmail(user.email, "Cart Updated", `Product ${productId} added to your cart.`);
    res.status(200).json({ message: "Product added to cart successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = [];
    await user.save();

    // Email Notification
    await sendEmail(user.email, "Cart Cleared", "Your shopping cart has been cleared.");

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================== USER CRUD ==================
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, phoneNumber, password, role, status, address, paymentMethods } = req.body;
    let profileImage = req.body.profileImage;
    if (req.file && req.file.filename) {
      profileImage = req.file.filename;
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    if (status) user.status = status;
    if (address) user.address = address;
    if (paymentMethods) user.paymentMethods = paymentMethods;
    if(profileImage) user.profileImage = profileImage;
    await user.save();

    // Email Notification
    await sendEmail(user.email, "Profile Updated", "Your account details have been updated successfully.");

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

    // Email Notification
    await sendEmail(user.email, "Account Deleted", "Your account has been deleted from our system.");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================== OTHER ==================
const productDetails = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deliveryBoyDetails = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find();
    res.status(200).json({ deliveryBoys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const user = await User.findById(order.userId);

    // Email Notification
    await sendEmail(user.email, "Order Tracking", `You are tracking order ID: ${order._id}, Current Status: ${order.status}`);

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOtp,
  forgetPassword,
  changePassword,
  addOrders,
  addtoCart,
  viewCart,
  clearCart,
  updateUser,
  deleteUser,
  productDetails,
  deliveryBoyDetails,
  trackOrder
};
