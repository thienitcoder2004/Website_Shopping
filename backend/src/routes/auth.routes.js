const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);

module.exports = router;
