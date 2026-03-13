const router = require("express").Router();

const productController = require("../controllers/product.controller");
const productReviewController = require("../controllers/productReview.controller");

const { protect } = require("../middlewares/auth.middleware");
const { uploadReviewImages } = require("../middlewares/upload.middleware");

// ================= PRODUCT REVIEW =================

// Public: lấy toàn bộ review theo sản phẩm
router.get("/:id/reviews", productReviewController.getByProduct);

// Login required: tạo review mới
router.post(
  "/:id/reviews",
  protect,
  uploadReviewImages.array("images", 5),
  productReviewController.createReview
);

// Login required: trả lời review
router.post(
  "/:id/reviews/:reviewId/replies",
  protect,
  uploadReviewImages.array("images", 3),
  productReviewController.createReply
);

// Login required: đánh dấu hữu ích
router.post(
  "/reviews/:reviewId/helpful",
  protect,
  productReviewController.markHelpful
);

// ================= PRODUCT =================

router.get("/slug/:slug", productController.getBySlug);
router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

module.exports = router;