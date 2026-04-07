const router = require("express").Router();
const staff = require("../../controllers/Auth/staff.controller");
const { protect, checkRole } = require("../../middlewares/auth.middleware");

router.use(protect, checkRole(["staff", "admin"]));

router.get("/me", staff.getStaffProfile);
router.put("/me", staff.updateStaffProfile);

module.exports = router;