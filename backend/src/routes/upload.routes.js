const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// lưu vào /uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, "-")
            .toLowerCase();
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});

const upload = multer({ storage });

// upload nhiều file: field name = "files"
router.post("/", upload.array("files", 20), (req, res) => {
    const files = (req.files || []).map((f) => `/uploads/${f.filename}`);
    return res.json({ ok: true, data: { files } });
});

module.exports = router;
