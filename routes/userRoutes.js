const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {userUpload}=require('../config/multerConfig');
const {uploadDoc}=require('../config/multerConfig');
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Auth
router.post("/register",userUpload.single('profileImage'), userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/send-otp", userController.sendOTP);
router.post("/verify-otp", userController.verifyOtp);
router.post("/forget-password", userController.forgetPassword);
router.post("/change-password", authenticateToken, authorizeRole("user"), userController.changePassword);

// Products & Delivery
router.get("/products", userController.productDetails); // get all products
router.get("/delivery-boys", userController.deliveryBoyDetails); // get all delivery boys

// Cart (use logged in user from JWT)
router.post("/cart/:id", authenticateToken, authorizeRole("user"), userController.addtoCart);
router.get("/cart/:id", authenticateToken, authorizeRole("user"), userController.viewCart);
router.delete("/cart/:id", authenticateToken, authorizeRole("user"), userController.clearCart);

// Orders
router.post("/orders", authenticateToken, authorizeRole("user"), userController.addOrders);
router.get("/orders/:id/track", authenticateToken, authorizeRole("user"), userController.trackOrder);

// Profile
router.put("/profile", authenticateToken, authorizeRole("user"),userUpload.single('profileImage'), userController.updateUser);
router.delete("/profile", authenticateToken, authorizeRole("user"), userController.deleteUser);

module.exports = router;
