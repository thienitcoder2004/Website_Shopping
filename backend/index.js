require("dotenv").config();
const bcrypt = require("bcryptjs");

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/database");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./src/routes/auth.routes"));

app.get("/", (req, res) => {
    res.send("Server đang khởi động...");
});

const PORT = process.env.PORT || 5000;


const User = require("./src/models/User");

const createDefaultAdmin = async () => {
    try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log("⚠️ DEFAULT_ADMIN not set in .env");
            return;
        }

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("ℹ️ Admin already exists");
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

        console.log("🔥 Default Admin Created");
        console.log("📧 Email:", adminEmail);
        console.log("🔑 Password:", adminPassword);
    } catch (error) {
        console.log("Create Admin Error:", error.message);
    }
};

connectDB();
createDefaultAdmin();

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
