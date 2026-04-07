const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file hình ảnh"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// upload nhiều ảnh
router.post("/", upload.array("files", 20), (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({
      ok: false,
      message: "Chưa chọn file ảnh",
    });
  }

  const files = req.files.map((f) => `/uploads/${f.filename}`);

  return res.json({
    ok: true,
    message: "Upload ảnh thành công",
    data: { files },
  });
});

module.exports = router;