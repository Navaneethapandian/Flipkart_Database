const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Destructure controller functions for cleaner usage
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  UpdateAdmin,
  deleteAdmin,
  addProduct,
  updateProduct,
  deleteProduct,
  productStock,
  viewAllProducts,
  viewAllUsers,
  updateUser,
  deleteUser,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  viewAllDeliveryBoys,
  deleteOrder,
  viewAllOrders,
  getUserReports,
  getProductReports,
  getOrderReports,
  getRevenueReports,
  assignOrder,
} = adminController;

// 🔹 Auth
router.post("/adminRegister", registerAdmin);
router.post("/adminLogin", loginAdmin);

// 🔹 Admin Profile
router.get("/getAdminProfile", authenticateToken, authorizeRole("admin"), getAdminProfile);

// 🔹 Admin CRUD
router.put("/updateAdmin/:id", authenticateToken, authorizeRole("admin"), UpdateAdmin);
router.delete("/deleteAdmin/:adminId", authenticateToken, authorizeRole("admin"), deleteAdmin);

// 🔹 Product Management
router.post("/addProduct", authenticateToken, authorizeRole("admin"), addProduct);
router.put("/updateProduct/:productId", authenticateToken, authorizeRole("admin"), updateProduct);
router.delete("/deleteProduct/:productId", authenticateToken, authorizeRole("admin"), deleteProduct);
router.put("/productStock/:id", authenticateToken, authorizeRole("admin"), productStock);
router.get("/viewAllProducts", authenticateToken, authorizeRole("admin"), viewAllProducts);

// 🔹 User Management
router.get("/viewAllUsers", authenticateToken, authorizeRole("admin"), viewAllUsers);
router.put("/updateUser/:userId", authenticateToken, authorizeRole("admin"), updateUser);
router.delete("/deleteUser/:userId", authenticateToken, authorizeRole("admin"), deleteUser);

// 🔹 Delivery Boy Management
router.put("/updateDeliveryBoy/:deliveryBoyId", authenticateToken, authorizeRole("admin"), updateDeliveryBoy);
router.delete("/deleteDeliveryBoy/:deliveryBoyId", authenticateToken, authorizeRole("admin"), deleteDeliveryBoy);
router.get("/viewAllDeliveryBoys", authenticateToken, authorizeRole("admin"), viewAllDeliveryBoys);

// 🔹 Order Management
router.delete("/deleteOrder/:orderId", authenticateToken, authorizeRole("admin"), deleteOrder);
router.get("/viewAllOrders", authenticateToken, authorizeRole("admin"), viewAllOrders);

// 🔹 Assign Orders
router.post("/assign-order", authenticateToken, authorizeRole("admin"), assignOrder);

// 🔹 Reports
router.get("/getUserReports", authenticateToken, authorizeRole("admin"), getUserReports);
router.get("/getProductReports", authenticateToken, authorizeRole("admin"), getProductReports);
router.get("/getOrderReports", authenticateToken, authorizeRole("admin"), getOrderReports);
router.get("/getRevenueReports", authenticateToken, authorizeRole("admin"), getRevenueReports);

module.exports = router;
