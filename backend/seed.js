require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/database");

// ===== MODELS =====
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Brand = require("./src/models/Brand");
const Product = require("./src/models/Product");

// ===== HELPERS =====
const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ===== ẢNH SẢN PHẨM =====
const productImages = Array.from({ length: 63 }).map(
    (_, i) => `/uploads/products/p${i + 1}.png` // ✅ folder đúng
);

// ===== MAIN SEED =====
const seedData = async () => {
    try {
        await connectDB();

        console.log("🔥 CLEAR DB...");
        await Promise.all([
            User.deleteMany(),
            Category.deleteMany(),
            Brand.deleteMany(),
            Product.deleteMany(),
        ]);

        console.log("🌱 SEEDING DATA...");

        // ===== ADMIN =====
        let admin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(
                process.env.DEFAULT_ADMIN_PASSWORD,
                12
            );
            admin = await User.create({
                firstName: "Admin",
                lastName: "System",
                email: process.env.DEFAULT_ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
                provider: "local",
            });
            console.log("✅ Admin created:", process.env.DEFAULT_ADMIN_EMAIL);
        }

        // ===== CATEGORIES =====
        const categories = await Category.insertMany([
            { name: "Áo Nam", slug: "ao-nam" },
            { name: "Áo Nữ", slug: "ao-nu" },
            { name: "Quần Nam", slug: "quan-nam" },
            { name: "Quần Nữ", slug: "quan-nu" },
            { name: "Phụ kiện", slug: "phu-kien" },
        ]);
        const getCate = (slug) => categories.find((c) => c.slug === slug)._id;

        // ===== BRANDS =====
        const brands = await Brand.insertMany([
            { name: "DirtyCoins", slug: "dirtycoins" },
            { name: "Degrey", slug: "degrey" },
            { name: "Hades", slug: "hades" },
            { name: "Zara", slug: "zara" },
        ]);

        // ===== PRODUCTS =====
        const products = [];

        // 🔹 Phụ kiện - Nón (p1 → p10)
        const phuKienCate = getCate("phu-kien");
        for (let i = 0; i < 10; i++) {
            const price = rand(100000, 200000);
            products.push({
                name: `Nón thời trang ${i + 1}`,
                slug: `non-${i + 1}`,
                description: "Nón thời trang phong cách trẻ trung",
                price,
                salePrice: price - rand(10000, 20000),
                primaryImage: productImages[i],
                images: [productImages[i], productImages[i + 1] || productImages[i]],
                categoryId: phuKienCate,
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 100),
                colors: ["Đen", "Trắng", "Be"],
                sizes: ["Free size"],
                gender: "unisex",
                sold: rand(0, 100),
                isActive: true,
                createdBy: admin._id,
            });
        }

        // 🔹 Áo Nữ (p11 → p19)
        for (let i = 10; i < 19; i++) {
            const price = rand(200000, 400000);
            products.push({
                name: `Áo nữ ${i - 9}`,
                slug: `ao-nu-${i - 9}`,
                price,
                salePrice: price - rand(20000, 40000),
                primaryImage: productImages[i],
                images: [productImages[i]],
                categoryId: getCate("ao-nu"),
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 120),
                colors: ["Trắng", "Be", "Hồng"],
                sizes: ["S", "M", "L"],
                gender: "nu",
                sold: rand(0, 100),
                createdBy: admin._id,
            });
        }

        // 🔹 Quần Nam (p20 → p30)
        for (let i = 19; i < 30; i++) {
            const price = rand(300000, 600000);
            products.push({
                name: `Quần nam ${i - 18}`,
                slug: `quan-nam-${i - 18}`,
                price,
                salePrice: price - rand(30000, 60000),
                primaryImage: productImages[i],
                images: [productImages[i]],
                categoryId: getCate("quan-nam"),
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 150),
                colors: ["Đen", "Xám", "Xanh"],
                sizes: ["M", "L", "XL"],
                gender: "nam",
                sold: rand(0, 100),
                createdBy: admin._id,
            });
        }

        // 🔹 Quần Nữ (p31 → p40)
        for (let i = 30; i < 40; i++) {
            const price = rand(250000, 500000);
            products.push({
                name: `Quần nữ ${i - 29}`,
                slug: `quan-nu-${i - 29}`,
                price,
                salePrice: price - rand(20000, 50000),
                primaryImage: productImages[i],
                images: [productImages[i]],
                categoryId: getCate("quan-nu"),
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 120),
                colors: ["Trắng", "Be", "Đen"],
                sizes: ["S", "M", "L"],
                gender: "nu",
                sold: rand(0, 100),
                createdBy: admin._id,
            });
        }

        // 🔹 Áo Nam (p41 → p63)
        for (let i = 40; i < 63; i++) {
            const price = rand(200000, 450000);
            products.push({
                name: `Áo nam ${i - 39}`,
                slug: `ao-nam-${i - 39}`,
                price,
                salePrice: price - rand(20000, 40000),
                primaryImage: productImages[i],
                images: [productImages[i]],
                categoryId: getCate("ao-nam"),
                brandId: pick(brands)._id,
                stock: rand(10, 50),
                warehouseStock: rand(50, 150),
                colors: ["Đen", "Trắng", "Xám"],
                sizes: ["M", "L", "XL"],
                gender: "nam",
                sold: rand(0, 100),
                createdBy: admin._id,
            });
        }

        await Product.insertMany(products);
        console.log("✅ SEED SUCCESSFUL - All products created!");
        process.exit();
    } catch (err) {
        console.error("❌ ERROR:", err);
        process.exit(1);
    }
};

seedData();