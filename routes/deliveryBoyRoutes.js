const express = require("express");
const router = express.Router();
const {deliveryBoyUpload}=require('../config/multerConfig');
const {uploadDoc}=require('../config/multerConfig');
const deliveryBoyController = require("../controllers/deliveryBoyController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const {sendDeliveryBoyMessage}=require('../controllers/deliveryBoyController');
const { route } = require("./adminRoutes");

router.post("/register",deliveryBoyUpload.single('profileImage'), deliveryBoyController.deliveryBoyRegister);

// Login
router.post("/login", deliveryBoyController.deliveryBoyLogin);

router.post("/send-otp", authenticateToken, authorizeRole("deliveryBoy"),  deliveryBoyController.sendOTP);
router.post("/verify-otp",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.verifyOtp);

router.post("/forget-password",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.forgetPassword);

router.post("/change-password", authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.changePassword);

// Profile
router.get(  "/profile/:id", authenticateToken,  authorizeRole("deliveryBoy"), deliveryBoyController.getProfile);

router.put(  "/profile",  authenticateToken,  authorizeRole("deliveryBoy"),deliveryBoyUpload.single('profileImage'), deliveryBoyController.updateDeliveryBoyProfile);

router.get("/orders/:id", authenticateToken, authorizeRole("deliveryBoy"), deliveryBoyController.getAssignedOrders);
router.get("/assigned-orders/:id",authenticateToken, authorizeRole("deliveryBoy"), deliveryBoyController.viewAssignedOrders);

router.put("/order-status/:id",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.updateOrderStatus);
router.post("/send-message",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.sendDeliveryBoyMessage);

module.exports = router;
