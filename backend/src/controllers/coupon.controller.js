const Coupon = require("../models/Coupon");

// CREATE
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            type,
            value,
            startDate,
            endDate,
        } = req.body;

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu không được lớn hơn ngày kết thúc",
            });
        }

        const coupon = await Coupon.create(req.body);

        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ALL
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ONE
exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        res.json({ success: true, data: coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, data: coupon });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
