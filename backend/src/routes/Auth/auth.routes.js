const router = require("express").Router();
const auth = require("../../controllers/Auth/auth.controller");
const { protect } = require("../../middlewares/auth.middleware");

// AUTH
router.post("/register", auth.register);
router.post("/login", auth.login);

// PASSWORD
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);
router.post("/change-password", protect, auth.changePassword);

module.exports = router;