require("dotenv").config();

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

connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
