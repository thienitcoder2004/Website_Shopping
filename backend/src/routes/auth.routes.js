const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

// AUTH
router.post("/register", auth.register);
router.post("/login", auth.login);

// PASSWORD
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);
router.post("/change-password", protect, auth.changePassword);

// PROFILE
router.get("/profile", protect, auth.getProfile);
router.put("/update-profile", protect, auth.updateProfile);

module.exports = router;