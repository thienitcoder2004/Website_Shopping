require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/database");
const User = require("./src/models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middlewares =====
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static("uploads"));

// ===== Routes =====
app.use("/api/upload", require("./src/routes/upload.routes"));
app.use("/api/auth", require("./src/routes/Auth/auth.routes"));
app.use("/api/users", require("./src/routes/Auth/user.routes"));
app.use("/api/staff", require("./src/routes/Auth/staff.routes"));
app.use("/api/admin", require("./src/routes/Auth/admin.routes"));
app.use("/api/admin/reviews", require("./src/routes/adminReview.routes"));
app.use("/api/categories", require("./src/routes/category.routes"));
app.use("/api/news", require("./src/routes/news.routes"));
app.use("/api/contacts", require("./src/routes/contact.routes"));
app.use("/api/coupons", require("./src/routes/sales/coupon.routes"));
app.use("/api/brands", require("./src/routes/brand.routes"));
app.use("/api/products", require("./src/routes/product.routes"));
app.use("/api/inventory", require("./src/routes/inventory.route"));
app.use("/api/orders", require("./src/routes/sales/order.routes"));
app.use("/api/promotions", require("./src/routes/sales/promotion.routes"));

app.get("/", (req, res) => {
  res.send("Server is running ...");
});

// ===== 404 =====
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Route không tồn tại",
  });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  return res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Lỗi server",
  });
});

// ===== Create default admin =====
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Default admin not set in .env");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.create({
      firstName: "Admin",
      lastName: "System",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      provider: "local",
    });

    console.log("Default Admin Created");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
  } catch (error) {
    console.log("Create Admin Error:", error.message);
  }
};

// ===== Start app =====
const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();