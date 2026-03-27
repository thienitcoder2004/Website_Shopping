const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const newsCtrl = require("../controllers/news.controller");
const { protect, checkRole } = require("../middlewares/auth.middleware");

router.get("/", newsCtrl.getNews);
router.get("/slug/:slug", newsCtrl.getNewsBySlug);
router.get("/:id", newsCtrl.getNewsById);

router.post(
  "/",
  protect,
  checkRole(["admin", "staff"]),
  upload.array("images"),
  newsCtrl.createNews
);

router.put(
  "/:id",
  protect,
  checkRole(["admin", "staff"]),
  upload.array("images"),
  newsCtrl.updateNews
);

router.delete(
  "/:id",
  protect,
  checkRole(["admin"]),
  newsCtrl.deleteNews
);

router.post(
  "/:id/comments",
  protect,
  checkRole(["user", "staff", "admin"]),
  newsCtrl.addComment
);

module.exports = router;