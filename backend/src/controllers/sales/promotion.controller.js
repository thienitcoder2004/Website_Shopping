const Promotion = require("../../models/sales/Promotion");
const Product = require("../../models/Product");

function normalizeProductIds(productIds) {
  if (!Array.isArray(productIds)) return [];
  return productIds
    .map((id) => String(id || "").trim())
    .filter(Boolean);
}

function calculatePromotionPrice(productPrice, promotion) {
  const price = Number(productPrice || 0);
  if (price <= 0 || !promotion) return price;

  let discount = 0;

  if (promotion.type === "percentage") {
    discount = (price * Number(promotion.value || 0)) / 100;

    if (Number(promotion.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(promotion.maxDiscount || 0));
    }
  } else {
    discount = Number(promotion.value || 0);
  }

  discount = Math.min(discount, price);

  return Math.max(0, price - discount);
}

async function validateProductsExist(productIds) {
  if (!productIds.length) return;

  const count = await Product.countDocuments({
    _id: { $in: productIds },
  });

  if (count !== productIds.length) {
    throw new Error("Có sản phẩm không tồn tại trong danh sách áp dụng");
  }
}

// CREATE
exports.createPromotion = async (req, res) => {
  try {
    const {
      name,
      type,
      value,
      maxDiscount,
      startDate,
      endDate,
      isActive,
      productIds,
      saleStock,
      perUserLimit,
      priority,
    } = req.body;

    if (!name || !type || value === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại khuyến mãi không hợp lệ",
      });
    }

    if (Number(value) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị khuyến mãi phải lớn hơn 0",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
      });
    }

    const normalizedProductIds = normalizeProductIds(productIds);

    if (!normalizedProductIds.length) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất 1 sản phẩm áp dụng",
      });
    }

    await validateProductsExist(normalizedProductIds);

    const promotion = await Promotion.create({
      name: String(name).trim(),
      type,
      value: Number(value),
      maxDiscount: Number(maxDiscount || 0),
      startDate,
      endDate,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      productIds: normalizedProductIds,
      saleStock: Number(saleStock || 0),
      soldCount: 0,
      perUserLimit: Number(perUserLimit || 0),
      priority: Number(priority || 0),
    });

    return res.status(201).json({
      success: true,
      data: promotion,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Tạo chương trình khuyến mãi thất bại",
    });
  }
};

// GET ALL
exports.getPromotions = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (q) {
      filter.name = { $regex: String(q).trim(), $options: "i" };
    }

    if (status === "active") {
      filter.isActive = true;
    }

    const promotions = await Promotion.find(filter)
      .populate("productIds", "name slug price salePrice primaryImage images")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: promotions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Không lấy được danh sách khuyến mãi",
    });
  }
};

// GET ACTIVE PROMOTIONS
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("productIds", "name slug price salePrice primaryImage images")
      .sort({ priority: -1, createdAt: -1 });

    const mapped = promotions.map((promotion) => {
      const json = promotion.toObject();

      json.products = Array.isArray(json.productIds)
        ? json.productIds.map((product) => {
            const basePrice =
              Number(product.salePrice) > 0
                ? Number(product.salePrice)
                : Number(product.price || 0);

            return {
              ...product,
              originalPrice: basePrice,
              promotionPrice: calculatePromotionPrice(basePrice, json),
            };
          })
        : [];

      return json;
    });

    return res.json({
      success: true,
      data: mapped,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Không lấy được chương trình đang hoạt động",
    });
  }
};

// GET ONE
exports.getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id).populate(
      "productIds",
      "name slug price salePrice primaryImage images"
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình khuyến mãi",
      });
    }

    const json = promotion.toObject();
    json.products = Array.isArray(json.productIds)
      ? json.productIds.map((product) => {
          const basePrice =
            Number(product.salePrice) > 0
              ? Number(product.salePrice)
              : Number(product.price || 0);

          return {
            ...product,
            originalPrice: basePrice,
            promotionPrice: calculatePromotionPrice(basePrice, json),
          };
        })
      : [];

    return res.json({
      success: true,
      data: json,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Không lấy được chi tiết khuyến mãi",
    });
  }
};

// UPDATE
exports.updatePromotion = async (req, res) => {
  try {
    const oldPromotion = await Promotion.findById(req.params.id);

    if (!oldPromotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình khuyến mãi",
      });
    }

    const nextName =
      req.body.name !== undefined ? String(req.body.name).trim() : oldPromotion.name;

    const nextType = req.body.type !== undefined ? req.body.type : oldPromotion.type;
    const nextValue =
      req.body.value !== undefined ? Number(req.body.value) : oldPromotion.value;
    const nextMaxDiscount =
      req.body.maxDiscount !== undefined
        ? Number(req.body.maxDiscount)
        : oldPromotion.maxDiscount;
    const nextStartDate = req.body.startDate || oldPromotion.startDate;
    const nextEndDate = req.body.endDate || oldPromotion.endDate;
    const nextIsActive =
      req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : oldPromotion.isActive;
    const nextSaleStock =
      req.body.saleStock !== undefined
        ? Number(req.body.saleStock)
        : oldPromotion.saleStock;
    const nextPerUserLimit =
      req.body.perUserLimit !== undefined
        ? Number(req.body.perUserLimit)
        : oldPromotion.perUserLimit;
    const nextPriority =
      req.body.priority !== undefined
        ? Number(req.body.priority)
        : oldPromotion.priority;

    const nextProductIds =
      req.body.productIds !== undefined
        ? normalizeProductIds(req.body.productIds)
        : oldPromotion.productIds.map((id) => String(id));

    if (!["percentage", "fixed"].includes(nextType)) {
      return res.status(400).json({
        success: false,
        message: "Loại khuyến mãi không hợp lệ",
      });
    }

    if (Number(nextValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị khuyến mãi phải lớn hơn 0",
      });
    }

    if (new Date(nextStartDate) >= new Date(nextEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
      });
    }

    if (!nextProductIds.length) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất 1 sản phẩm áp dụng",
      });
    }

    await validateProductsExist(nextProductIds);

    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      {
        name: nextName,
        type: nextType,
        value: nextValue,
        maxDiscount: nextMaxDiscount,
        startDate: nextStartDate,
        endDate: nextEndDate,
        isActive: nextIsActive,
        productIds: nextProductIds,
        saleStock: nextSaleStock,
        perUserLimit: nextPerUserLimit,
        priority: nextPriority,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("productIds", "name slug price salePrice primaryImage images");

    return res.json({
      success: true,
      data: promotion,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Cập nhật chương trình khuyến mãi thất bại",
    });
  }
};

// DELETE
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình khuyến mãi",
      });
    }

    await Promotion.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Xóa chương trình khuyến mãi thành công",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Xóa chương trình khuyến mãi thất bại",
    });
  }
};

// TOGGLE ACTIVE
exports.togglePromotionActive = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chương trình khuyến mãi",
      });
    }

    promotion.isActive = !promotion.isActive;
    await promotion.save();

    return res.json({
      success: true,
      message: promotion.isActive
        ? "Đã bật chương trình khuyến mãi"
        : "Đã tắt chương trình khuyến mãi",
      data: promotion,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Đổi trạng thái chương trình khuyến mãi thất bại",
    });
  }
};