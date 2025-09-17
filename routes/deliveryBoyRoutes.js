const express = require("express");
const router = express.Router();

const deliveryBoyController = require("../controllers/deliveryBoyController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const { getAssignedOrders } = require("../controllers/deliveryBoyController");


router.post("/register", deliveryBoyController.deliveryBoyRegister);

// Login
router.post("/login", deliveryBoyController.deliveryBoyLogin);

router.post("/send-otp", authenticateToken, authorizeRole("deliveryBoy"),  deliveryBoyController.sendOTP);
router.post("/verify-otp",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.verifyOtp);

router.post("/forget-password",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.forgetPassword);

router.post("/change-password", authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.changePassword);

// Profile
router.get(  "/profile/:id", authenticateToken,  authorizeRole("deliveryBoy"), deliveryBoyController.getProfile);

router.put(  "/profile",  authenticateToken,  authorizeRole("deliveryBoy"), deliveryBoyController.updateDeliveryBoyProfile);

router.get("/orders/:id", authenticateToken, authorizeRole("deliveryBoy"), getAssignedOrders);
router.get("/assigned-orders/:id",authenticateToken, authorizeRole("deliveryBoy"), deliveryBoyController.viewAssignedOrders);

router.put("/order-status/:id",authenticateToken,authorizeRole("deliveryBoy"),deliveryBoyController.updateOrderStatus);

module.exports = router;
