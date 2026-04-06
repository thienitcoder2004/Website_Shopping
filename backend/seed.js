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

// NEW
const News = require("./src/models/News");
const Contact = require("./src/models/Contact");

// ===== HELPER =====
const slugify = (text) =>
    text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ===== DATA =====
const productNames = [
    "Áo thun basic cotton",
    "Áo hoodie form rộng",
    "Quần jean rách gối",
    "Áo sơ mi Hàn Quốc",
    "Áo khoác bomber",
    "Quần short kaki",
    "Áo polo nam",
    "Áo len mùa đông",
    "Chân váy xếp ly",
    "Đầm nữ nhẹ nhàng",
];

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
        for (let i = 0; i < 10; i++) {
            const price = rand(150000, 600000);

            products.push({
                name: productNames[i],
                slug: slugify(productNames[i]) + "-" + rand(1, 999),
                price,
                salePrice: price - rand(10000, 80000),
                primaryImage: `/uploads/product-${i + 1}.jpg`,
                images: [`/uploads/product-${i + 1}.jpg`],
                categoryId: pick(categories)._id,
                brandId: brands[i]._id,
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
            {
                code: "FREESHIP",
                type: "fixed",
                value: 30000,
                startDate: new Date(),
                endDate: new Date("2026-12-31"),
            },
            ...Array.from({ length: 8 }).map((_, i) => ({
                code: `SALE${i}`,
                type: pick(["percentage", "fixed"]),
                value: rand(10, 50),
                startDate: new Date(),
                endDate: new Date("2026-12-31"),
            })),
        ]);

        // ===== PROMOTION =====
        await Promotion.insertMany(
            createdProducts.map((p) => ({
                name: `Flash Sale ${p.name}`,
                type: "percentage",
                value: rand(10, 30),
                maxDiscount: 50000,
                startDate: new Date(),
                endDate: new Date("2026-12-31"),
                productIds: [p._id],
                saleStock: rand(20, 100),
            }))
        );

        // ===== ORDER =====
        await Order.insertMany(
            Array.from({ length: 10 }).map((_, i) => {
                const product = pick(createdProducts);
                const qty = rand(1, 3);

                return {
                    orderCode: `ORD${Date.now()}${i}`,
                    userId: pick(users)._id,
                    items: [
                        {
                            productId: product._id,
                            name: product.name,
                            price: product.salePrice,
                            originalPrice: product.price,
                            quantity: qty,
                            color: pick(colors),
                            size: pick(sizes),
                            lineTotal: product.salePrice * qty,
                        },
                    ],
                    subtotalAmount: product.salePrice * qty,
                    totalAmount: product.salePrice * qty,
                    paymentMethod: pick(["COD", "MOMO"]),
                    customerName: "Nguyen Van B",
                    customerPhone: "0909123456",
                    customerAddress: "TP.HCM",
                };
            })
        );

        // ===== REVIEW =====
        await ProductReview.insertMany(
            Array.from({ length: 10 }).map(() => ({
                productId: pick(createdProducts)._id,
                userId: pick(users)._id,
                rating: rand(3, 5),
                comment: pick([
                    "Đẹp xịn 👍",
                    "Chất vải ok",
                    "Đáng tiền",
                    "Mặc rất thích",
                    "Sẽ mua lại",
                ]),
                displayName: "User",
            }))
        );

        // ===== NEWS =====
        const newsTitles = [
            "Top outfit streetwear 2026",
            "Phối hoodie chuẩn Hàn",
            "Trend thời trang nam",
            "Mix đồ Gen Z",
            "Áo thun must-have",
            "Jean rách còn hot?",
            "Style basic xịn",
            "Streetwear VN",
            "Outfit hẹn hò",
            "Outfit đi học",
        ];

        await News.insertMany(
            newsTitles.map((title, i) => ({
                title,
                slug: slugify(title) + "-" + i,
                content: `Nội dung chi tiết cho "${title}"`,
                thumbnail: `/uploads/news-${i + 1}.jpg`,
                authorId: users[0]._id,
                tags: ["fashion", "trend"],
            }))
        );

        // ===== CONTACT =====
        const messages = [
            "Shop còn size M không?",
            "Ship bao lâu?",
            "Có đổi trả không?",
            "Có màu khác không?",
            "Có freeship không?",
            "Shop ở đâu?",
            "Chất liệu gì?",
            "Có sale không?",
            "Mua nhiều giảm không?",
            "Có Momo không?",
        ];

        await Contact.insertMany(
            messages.map((msg, i) => ({
                name: `Khách ${i + 1}`,
                email: `khach${i + 1}@gmail.com`,
                phone: `09${rand(10000000, 99999999)}`,
                message: msg,
                status: i % 2 === 0 ? "pending" : "replied",
            }))
        );

        console.log("✅ SEED SUCCESS FULL DATA!");
        process.exit();
    } catch (err) {
        console.error("❌ ERROR:", err);
        process.exit(1);
    }
};

seedData();