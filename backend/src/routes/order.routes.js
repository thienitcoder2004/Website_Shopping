const express = require("express");
const router = express.Router();

const {
    createCashOrder,
    createMomoPayment,
    momoIpn,
    getMyOrders,
    getMyOrderDetail,
    getAdminOrders,
    updateAdminOrderStatus,
} = require("../controllers/order.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.post("/cash", protect, createCashOrder);
router.post("/momo", protect, createMomoPayment);
router.post("/momo/ipn", momoIpn);

router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderDetail);

router.get("/admin", protect, adminOnly, getAdminOrders);
router.patch("/admin/:id/status", protect, adminOnly, updateAdminOrderStatus);

module.exports = router;