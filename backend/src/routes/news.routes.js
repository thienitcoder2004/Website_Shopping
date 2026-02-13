const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const newsCtrl = require("../controllers/news.controller");

router.post("/", upload.array("images"), newsCtrl.createNews);
router.get("/", newsCtrl.getNews);
router.get("/:id", newsCtrl.getNewsById);
router.get("/slug/:slug", newsCtrl.getNewsBySlug);
router.put("/:id", upload.array("images"), newsCtrl.updateNews);
router.delete("/:id", newsCtrl.deleteNews);

module.exports = router;
