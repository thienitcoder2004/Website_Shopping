require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/database");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Dental Clinic API is running");
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
