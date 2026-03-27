const router = require("express").Router();
const controller = require("../../controllers/sales/promotion.controller");
const { protect, adminOnly } = require("../../middlewares/auth.middleware");

// public
router.get("/", controller.getPromotions);
router.get("/active/list", controller.getActivePromotions);
router.get("/:id", controller.getPromotion);

// admin
router.post("/", protect, adminOnly, controller.createPromotion);
router.put("/:id", protect, adminOnly, controller.updatePromotion);
router.delete("/:id", protect, adminOnly, controller.deletePromotion);
router.patch("/:id/toggle-active", protect, adminOnly, controller.togglePromotionActive);

module.exports = router;