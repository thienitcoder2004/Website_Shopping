const router = require("express").Router();
const contactController = require("../controllers/contact.controller");
const { protect, checkRole } = require("../middlewares/auth.middleware");

// Public
router.post("/", contactController.createContact);

// Admin + Staff
router.get("/", protect, checkRole(["admin", "staff"]), contactController.getContacts);
router.put("/:id", protect, checkRole(["admin", "staff"]), contactController.updateContact);
router.patch("/:id/resolve", protect, checkRole(["admin", "staff"]), contactController.resolveContact);

// Only Admin
router.delete("/:id", protect, checkRole(["admin"]), contactController.deleteContact);

module.exports = router;