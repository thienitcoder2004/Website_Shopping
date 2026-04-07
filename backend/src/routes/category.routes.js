const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const { protect, checkRole } = require("../middlewares/auth.middleware");

router.get("/", categoryController.getCategories);

router.post(
  "/",
  protect,
  checkRole(["admin", "staff"]),
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  checkRole(["admin", "staff"]),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  protect,
  checkRole(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;