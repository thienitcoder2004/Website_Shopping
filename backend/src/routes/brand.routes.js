const express = require("express");
const router = express.Router();

const {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
} = require("../controllers/brand.controller");

const { protect, checkRole } = require("../middlewares/auth.middleware");

// PUBLIC
router.get("/", getAllBrands);
router.get("/:id", getBrandById);

// ADMIN + STAFF
router.post("/", protect, checkRole(["admin", "staff"]), createBrand);
router.put("/:id", protect, checkRole(["admin", "staff"]), updateBrand);
router.delete("/:id", protect, checkRole(["admin"]), deleteBrand);

module.exports = router;