const Coupon = require("../../models/sales/Coupon");
// hàm tính giảm giá
function calculateDiscount(coupon, subtotal) {
  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;

    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, subtotal);

  return Math.max(0, discount);
}

// CREATE
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (!code || !type || value === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu không được lớn hơn ngày kết thúc",
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({ code: normalizedCode });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã tồn tại",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      type,
      value: Number(value),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: Number(maxDiscount || 0),
      usageLimit: Number(usageLimit || 0),
      startDate,
      endDate,
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: coupons });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ONE
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE
exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu không được lớn hơn ngày kết thúc",
      });
    }

    const oldCoupon = await Coupon.findById(req.params.id);

    if (!oldCoupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    let normalizedCode = oldCoupon.code;

    if (code) {
      normalizedCode = String(code).trim().toUpperCase();

      const existingCoupon = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: req.params.id },
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá đã tồn tại",
        });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: normalizedCode,
        type,
        value: value !== undefined ? Number(value) : oldCoupon.value,
        minOrderValue:
          minOrderValue !== undefined
            ? Number(minOrderValue)
            : oldCoupon.minOrderValue,
        maxDiscount:
          maxDiscount !== undefined
            ? Number(maxDiscount)
            : oldCoupon.maxDiscount,
        usageLimit:
          usageLimit !== undefined ? Number(usageLimit) : oldCoupon.usageLimit,
        startDate: startDate || oldCoupon.startDate,
        endDate: endDate || oldCoupon.endDate,
        isActive:
          isActive !== undefined ? Boolean(isActive) : oldCoupon.isActive,
      },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// VALIDATE COUPON
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    const orderSubtotal = Number(subtotal || 0);

    if (orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị đơn hàng không hợp lệ",
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const coupon = await Coupon.findOne({
      code: normalizedCode,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Mã giảm giá không tồn tại hoặc đã bị khóa",
      });
    }

    const now = new Date();

    if (now < new Date(coupon.startDate)) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá chưa đến thời gian sử dụng",
      });
    }

    if (now > new Date(coupon.endDate)) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết hạn",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết lượt sử dụng",
      });
    }

    if (orderSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString("vi-VN")} VNĐ`,
      });
    }

    const discount = calculateDiscount(coupon, orderSubtotal);
    const finalTotal = Math.max(0, orderSubtotal - discount);

    return res.json({
      success: true,
      message: "Áp mã thành công",
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minOrderValue: coupon.minOrderValue,
          maxDiscount: coupon.maxDiscount,
        },
        discount,
        finalTotal,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};