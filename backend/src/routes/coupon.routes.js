const router = require("express").Router();
const controller = require("../controllers/coupon.controller");

router.post("/", controller.createCoupon);
router.get("/", controller.getCoupons);
router.get("/:id", controller.getCoupon);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);

module.exports = router;
