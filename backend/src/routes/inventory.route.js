const router = require("express").Router();
const inventoryController = require("../controllers/inventory.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.use(protect, adminOnly);

router.post("/adjust", inventoryController.adjust);
router.get("/history", inventoryController.history);

module.exports = router;
