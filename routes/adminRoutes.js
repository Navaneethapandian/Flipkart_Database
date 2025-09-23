const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {adminUpload}=require('../config/multerConfig');
const {sendAdminMessage}=require('../controllers/adminController')
const {uploadDoc}=require('../config/multerConfig');
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/adminRegister",adminUpload.single('profileImage'), adminController.registerAdmin);

router.post("/adminLogin", adminController.loginAdmin);

router.get("/getAdminProfile", authenticateToken, authorizeRole("admin"),adminController.getAdminProfile);

router.put("/updateAdmin/:id", authenticateToken, authorizeRole("admin"),adminUpload.single('profileImage'), adminController.UpdateAdmin);
router.delete("/deleteAdmin/:id", adminController.deleteAdmin);

router.post("/addProduct", authenticateToken, authorizeRole("admin"), adminController.addProduct);
router.put("/updateProduct/:productId", authenticateToken, authorizeRole("admin"), adminController.updateProduct);
router.delete("/deleteProduct/:productId", authenticateToken, authorizeRole("admin"), adminController.deleteProduct);
router.delete("/deleteProduct/:productId", authenticateToken, authorizeRole("admin"), adminController.deleteProduct);
router.put("/productStock/:id", authenticateToken, authorizeRole("admin"), adminController.productStock);
router.get("/viewAllProducts", authenticateToken, authorizeRole("admin"), adminController.viewAllProducts);

router.get("/viewAllUsers", authenticateToken, authorizeRole("admin"), adminController.viewAllUsers);
router.put("/updateUser/:userId", authenticateToken, authorizeRole("admin"), adminController.updateUser);
router.delete("/deleteUser/:userId", authenticateToken, authorizeRole("admin"), adminController.deleteUser);

router.put("/updateDeliveryBoy/:deliveryBoyId", authenticateToken, authorizeRole("admin"), adminController.updateDeliveryBoy);
router.delete("/deleteDeliveryBoy/:deliveryBoyId", authenticateToken, authorizeRole("admin"), adminController.deleteDeliveryBoy);
router.get("/viewAllDeliveryBoys", authenticateToken, authorizeRole("admin"), adminController.viewAllDeliveryBoys);

router.delete("/deleteOrder/:orderId", authenticateToken, authorizeRole("admin"), adminController.deleteOrder);
router.get("/viewAllOrders", authenticateToken, authorizeRole("admin"), adminController.viewAllOrders);

router.post("/assign-order", authenticateToken, authorizeRole("admin"), adminController.assignOrder);

router.get("/getUserReports", authenticateToken, authorizeRole("admin"), adminController.getUserReports);
router.get("/getProductReports", authenticateToken, authorizeRole("admin"), adminController.getProductReports);
router.get("/getOrderReports", authenticateToken, authorizeRole("admin"), adminController.getOrderReports);
router.get("/getRevenueReports", authenticateToken, authorizeRole("admin"), adminController.getRevenueReports);
router.post("/send-message",  authenticateToken, authorizeRole("admin"), adminController.sendAdminMessage);


module.exports = router;
