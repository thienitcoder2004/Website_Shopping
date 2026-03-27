const express = require("express");
const router = express.Router();

const {
  createCashOrder,
  createMomoPayment,
  momoIpn,
  momoReturn,
  getMyOrders,
  getMyOrderDetail,
  getAdminOrders,
  updateAdminOrderStatus,
} = require("../../controllers/sales/order.controller");

const { protect, checkRole } = require("../../middlewares/auth.middleware");

// User
router.post("/cash", protect, createCashOrder);
router.post("/momo", protect, createMomoPayment);
router.post("/momo/ipn", momoIpn);
router.post("/momo/return", protect, momoReturn);

router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderDetail);

// Admin + Staff
router.get("/admin", protect, checkRole(["admin", "staff"]), getAdminOrders);
router.patch(
  "/admin/:id/status",
  protect,
  checkRole(["admin", "staff"]),
  updateAdminOrderStatus
);

module.exports = router;