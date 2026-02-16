const express = require("express");
const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getDashboardStats,
} = require("../controllers/admin.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/stats", protect, adminOnly, getDashboardStats);

router.get("/users", protect, adminOnly, getUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.patch("/users/:id/toggle", protect, adminOnly, toggleUserStatus);

module.exports = router;
