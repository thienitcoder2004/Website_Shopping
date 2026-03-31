const router = require("express").Router();
const inventoryController = require("../controllers/inventory.controller");
const { protect, checkRole } = require("../middlewares/auth.middleware");

router.use(protect, checkRole(["admin", "staff"]));

router.post("/adjust", inventoryController.adjust);
router.get("/history", inventoryController.history);

module.exports = router;