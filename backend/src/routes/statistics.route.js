const express = require("express");
const router = express.Router();
const Order = require("../models/sales/Order");
const Product = require("../models/Product");

// 📊 doanh thu
router.get("/revenue", async (req, res) => {
    try {
        const { type } = req.query;

        let format;

        if (type === "day") {
            format = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        } else if (type === "month") {
            format = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        } else {
            format = { $dateToString: { format: "%Y", date: "$createdAt" } };
        }

        const data = await Order.aggregate([
            {
                $group: {
                    _id: format,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Lỗi thống kê" });
    }
});

// 🔥 top 5 sản phẩm
router.get("/top-products", async (req, res) => {
    try {
        const data = await Product.find()
            .sort({ sold: -1 })
            .limit(5);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Lỗi top sản phẩm" });
    }
});

module.exports = router;