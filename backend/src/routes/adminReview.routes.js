const router = require("express").Router();

const adminReviewController = require("../controllers/adminReview.controller");
const { protect, checkRole } = require("../middlewares/auth.middleware");

router.use(protect, checkRole(["admin", "staff"]));

router.get("/", adminReviewController.list);
router.patch("/:id/toggle-active", adminReviewController.toggleActive);

// Chỉ admin mới được xóa cứng
router.delete("/:id", checkRole(["admin"]), adminReviewController.remove);

module.exports = router;