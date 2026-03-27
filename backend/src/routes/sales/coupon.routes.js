const router = require("express").Router();
const controller = require("../../controllers/sales/coupon.controller");
const { protect, checkRole } = require("../../middlewares/auth.middleware");

router.post("/validate/apply", controller.validateCoupon);

router.get("/", protect, checkRole(["admin"]), controller.getCoupons);
router.get("/:id", protect, checkRole(["admin"]), controller.getCoupon);
router.post("/", protect, checkRole(["admin"]), controller.createCoupon);
router.put("/:id", protect, checkRole(["admin"]), controller.updateCoupon);
router.delete("/:id", protect, checkRole(["admin"]), controller.deleteCoupon);

module.exports = router;