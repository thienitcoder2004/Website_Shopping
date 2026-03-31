const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  getDashboardStats,
} = require("../../controllers/Auth/admin.controller");

const { protect, adminOnly } = require("../../middlewares/auth.middleware");

router.get("/stats", protect, adminOnly, getDashboardStats);

// USERS
router.get("/users", protect, adminOnly, getUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.patch("/users/:id/toggle", protect, adminOnly, toggleUserStatus);

// STAFFS
router.get("/staffs", protect, adminOnly, getStaffs);
router.post("/staffs", protect, adminOnly, createStaff);
router.put("/staffs/:id", protect, adminOnly, updateStaff);
router.delete("/staffs/:id", protect, adminOnly, deleteStaff);
router.patch("/staffs/:id/toggle", protect, adminOnly, toggleStaffStatus);

module.exports = router;