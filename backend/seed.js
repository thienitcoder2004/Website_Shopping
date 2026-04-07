require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/database");

// ===== MODELS =====
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Brand = require("./src/models/Brand");
const Product = require("./src/models/Product");
const Coupon = require("./src/models/sales/Coupon");
const Order = require("./src/models/sales/Order");
const Promotion = require("./src/models/sales/Promotion");
const ProductReview = require("./src/models/ProductReview");
const News = require("./src/models/News");
const Contact = require("./src/models/Contact");

// ===== HELPER =====
const slugify = (text) =>
    text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ===== ẢNH =====
const productImages = Array.from({ length: 63 }).map(
    (_, i) => `/uploads/product/p${i + 1}.png`
);

const newsImages = Array.from({ length: 30 }).map(
    (_, i) => `/uploads/news/news${i + 1}.png`
);

// 🔥 ẢNH SALE
const saleImages = Array.from({ length: 30 }).map(
    (_, i) => `/uploads/sale/sale${i + 1}.png`
);

// ===== PRODUCT NAMES =====
const baseNames = [
    "Áo thun basic",
    "Áo hoodie",
    "Quần jean",
    "Áo sơ mi",
    "Áo khoác",
    "Quần short",
    "Áo polo",
    "Áo len",
    "Chân váy",
    "Đầm nữ",
];

const productNames = [];
for (let i = 0; i < 30; i++) {
    productNames.push(baseNames[i % baseNames.length] + " " + (i + 1));
}

// ===== NEWS =====
const newsTitles = [
    "Top outfit streetwear",
    "Phối hoodie chuẩn Hàn",
    "Trend thời trang nam",
    "Mix đồ Gen Z",
    "Áo thun must-have",
    "Jean rách còn hot?",
    "Style basic xịn",
    "Streetwear Việt Nam",
    "Outfit hẹn hò",
    "Outfit đi học",
];

const newsList = [];
for (let i = 0; i < 30; i++) {
    newsList.push(newsTitles[i % newsTitles.length] + " " + (i + 1));
}

const brandNames = [
    "DirtyCoins",
    "Degrey",
    "5TheWay",
    "Hades",
    "Coolmate",
    "Zara",
    "H&M",
    "Uniqlo",
    "Routine",
    "Yame",
];

const colors = ["Đen", "Trắng", "Xanh", "Be", "Nâu", "Xám"];
const sizes = ["S", "M", "L", "XL"];

// ===== MAIN =====
const seedData = async () => {
    try {
        await connectDB();

        console.log("🔥 CLEAR DB...");
        await Promise.all([
            User.deleteMany(),
            Category.deleteMany(),
            Brand.deleteMany(),
            Product.deleteMany(),
            Coupon.deleteMany(),
            Order.deleteMany(),
            Promotion.deleteMany(),
            ProductReview.deleteMany(),
            News.deleteMany(),
            Contact.deleteMany(),
        ]);

        console.log("🌱 SEEDING DATA...");

        // ===== USER =====
        const password = await bcrypt.hash("123456", 10);
        const users = await User.insertMany(
            Array.from({ length: 10 }).map((_, i) => ({
                firstName: "User",
                lastName: `${i}`,
                email: `user${i}@gmail.com`,
                password,
            }))
        );

        // ===== CATEGORY =====
        const categories = await Category.insertMany([
            { name: "Áo", slug: "ao" },
            { name: "Quần", slug: "quan" },
            { name: "Váy", slug: "vay" },
            { name: "Phụ kiện", slug: "phu-kien" },
            { name: "Áo khoác", slug: "ao-khoac" },
            { name: "Hoodie", slug: "hoodie" },
            { name: "Đồ nam", slug: "do-nam" },
            { name: "Đồ nữ", slug: "do-nu" },
            { name: "Streetwear", slug: "streetwear" },
            { name: "Basic", slug: "basic" },
        ]);

        // ===== BRAND =====
        const brands = await Brand.insertMany(
            brandNames.map((name) => ({
                name,
                slug: slugify(name),
            }))
        );

        // ===== PRODUCT =====
        const products = [];

        for (let i = 0; i < 30; i++) {
            const price = rand(150000, 600000);

            products.push({
                name: productNames[i],
                slug: slugify(productNames[i]) + "-" + rand(1, 999),
                price,
                salePrice: price - rand(10000, 80000),

                primaryImage: productImages[i],
                images: [
                    productImages[i],
                    productImages[(i + 1) % 30],
                    productImages[(i + 2) % 30],
                ],

                categoryId: pick(categories)._id,
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 200),
                colors: [pick(colors), pick(colors)],
                sizes: [pick(sizes), pick(sizes)],
                gender: pick(["nam", "nu", "unisex"]),
                sold: rand(0, 100),
                createdBy: users[0]._id,
            });
        }

        const createdProducts = await Product.insertMany(products);

        // ===== NEWS =====
        await News.insertMany(
            newsList.map((title, i) => ({
                title,
                slug: slugify(title) + "-" + i,
                content: `
          <h2>${title}</h2>
          <p>Xu hướng thời trang mới nhất 2026.</p>
          <img src="${newsImages[i]}" />
          <p>Phong cách trẻ trung năng động.</p>
        `,
                thumbnail: newsImages[i],
                authorId: users[0]._id,
                tags: ["fashion", "trend"],
            }))
        );

        // ===== COUPON =====
        await Coupon.insertMany([
            {
                code: "WELCOME10",
                type: "percentage",
                value: 10,
                minOrderValue: 200000,
                maxDiscount: 50000,
                startDate: new Date(),
                endDate: new Date("2026-12-31"),
            },
        ]);

        // ===== PROMOTION (🔥 có ảnh SALE) =====
        await Promotion.insertMany(
            createdProducts.map((p, i) => {
                const start = new Date();
                const end = new Date();
                end.setDate(end.getDate() + rand(5, 15));

                return {
                    name: `🔥 Flash Sale ${p.name}`,
                    type: "percentage",
                    value: rand(10, 40),
                    maxDiscount: 100000,

                    startDate: start,
                    endDate: end,
                    isActive: true,

                    // 🔥 ẢNH SALE
                    image: saleImages[i],

                    productIds: [p._id],
                    saleStock: rand(10, 50),
                };
            })
        );

        console.log("✅ SEED SUCCESS FULL (PRODUCT + NEWS + SALE IMAGE)");
        process.exit();
    } catch (err) {
        console.error("❌ ERROR:", err);
        process.exit(1);
    }
};

seedData();