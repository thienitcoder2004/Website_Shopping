const express = require("express");
const router = express.Router();

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getDashboardStats
} = require("../controllers/admin.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/stats", getDashboardStats);

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle", toggleUserStatus);

module.exports = router;
