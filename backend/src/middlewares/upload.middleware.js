const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const productDir = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(productDir, { recursive: true });

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, productDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
        cb(null, `${base}-${Date.now()}${ext}`);
    },
});

const imageFileFilter = (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only jpg/png/webp allowed"), ok);
};

const uploadProductImages = multer({
    storage: productStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = multer({ storage });
module.exports.uploadProductImages = uploadProductImages;