const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= COMMON =================
const imageFileFilter = (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only jpg/png/webp allowed"), ok);
};

function buildStorage(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });

    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, dirPath),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const base = path
                .basename(file.originalname, ext)
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9-_]/g, "");

            cb(null, `${base || "image"}-${Date.now()}${ext}`);
        },
    });
}

// ================= DEFAULT UPLOAD =================
const defaultDir = path.join(process.cwd(), "uploads");
const defaultStorage = buildStorage(defaultDir);

const upload = multer({
    storage: defaultStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= PRODUCT IMAGES =================
const productDir = path.join(process.cwd(), "uploads", "products");
const productStorage = buildStorage(productDir);

const uploadProductImages = multer({
    storage: productStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= REVIEW IMAGES =================
const reviewDir = path.join(process.cwd(), "uploads", "reviews");
const reviewStorage = buildStorage(reviewDir);

const uploadReviewImages = multer({
    storage: reviewStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadProductImages = uploadProductImages;
module.exports.uploadReviewImages = uploadReviewImages;