const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notification.controller");

router.get("/", ctrl.getAll);
router.get("/unread", ctrl.getUnread);
router.put("/:id/read", ctrl.markRead);

module.exports = router;