const express = require("express");
const router = express.Router();

const {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
} = require("../controllers/brand.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");

// PUBLIC
router.get("/", getAllBrands);
router.get("/:id", getBrandById);

// ADMIN
router.post("/", protect, adminOnly, createBrand);
router.put("/:id", protect, adminOnly, updateBrand);
router.delete("/:id", protect, adminOnly, deleteBrand);

module.exports = router;
