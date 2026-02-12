const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/", verifyToken, categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.put("/:id", verifyToken, categoryController.updateCategory);
router.delete("/:id", verifyToken, categoryController.deleteCategory);

module.exports = router;
