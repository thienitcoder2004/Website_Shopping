const router = require("express").Router();
const user = require("../../controllers/Auth/user.controller");
const { protect, checkRole } = require("../../middlewares/auth.middleware");

router.use(protect, checkRole(["user", "staff", "admin"]));

router.get("/me", user.getProfile);
router.put("/me", user.updateProfile);

module.exports = router;