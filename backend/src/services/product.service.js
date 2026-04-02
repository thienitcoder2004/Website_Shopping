const slugify = require("../utils/slugify");
const Product = require("../models/Product");
const Promotion = require("../models/sales/Promotion");

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await Product.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();
    if (!exists) return slug;
    slug = `${baseSlug}-${i++}`;
  }
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

async function getBestPromotionForProduct(productId) {
  const now = new Date();

  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    productIds: productId,
    $or: [
      { saleStock: 0 },
      { $expr: { $lt: ["$soldCount", "$saleStock"] } },
    ],
  })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  if (!promotions.length) return null;

  return promotions[0];
}

async function enrichProductPromotion(product) {
  if (!product) return product;

  const json =
    typeof product.toObject === "function" ? product.toObject() : product;

  const basePrice =
    Number(json.salePrice) > 0
      ? Number(json.salePrice)
      : Number(json.price || 0);

  const promotion = await getBestPromotionForProduct(json._id);

  if (!promotion) {
    return {
      ...json,
      originalPrice: basePrice,
      finalPrice: basePrice,
      activePromotion: null,
    };
  }

  const finalPrice = calculatePromotionPrice(basePrice, promotion);

  return {
    ...json,
    originalPrice: basePrice,
    finalPrice,
    activePromotion: {
      _id: promotion._id,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      maxDiscount: promotion.maxDiscount,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      saleStock: promotion.saleStock,
      soldCount: promotion.soldCount,
      perUserLimit: promotion.perUserLimit,
      priority: promotion.priority,
    },
  };
}

async function enrichProductListPromotion(products = []) {
  return Promise.all(products.map((item) => enrichProductPromotion(item)));
}

exports.list = async ({ q, page = 1, limit = 10, isActive }) => {
  const filter = {};
  if (typeof isActive !== "undefined") {
    filter.isActive = isActive === "true" || isActive === true;
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .lean(),
    Product.countDocuments(filter),
  ]);

  const enrichedItems = await enrichProductListPromotion(items);

  return {
    items: enrichedItems,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

exports.getById = async (id) => {
  const doc = await Product.findById(id)
    .populate("categoryId", "name")
    .populate("brandId", "name");

  if (!doc) throw new Error("PRODUCT_NOT_FOUND");

  return await enrichProductPromotion(doc);
};

exports.create = async (payload, userId) => {
  const baseSlug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const doc = await Product.create({
    ...payload,
    slug,
    createdBy: userId,
    updatedBy: userId,
  });

  return doc;
};

exports.update = async (id, payload, userId) => {
  const current = await Product.findById(id);
  if (!current) throw new Error("PRODUCT_NOT_FOUND");

  let slug = current.slug;
  if (payload.name || payload.slug) {
    const baseSlug = payload.slug
      ? slugify(payload.slug)
      : slugify(payload.name || current.name);
    slug = await ensureUniqueSlug(baseSlug, id);
  }

  Object.assign(current, payload, { slug, updatedBy: userId });
  await current.save();

  return current;
};

exports.remove = async (id) => {
  const doc = await Product.findByIdAndDelete(id);
  if (!doc) throw new Error("PRODUCT_NOT_FOUND");
  return doc;
};

exports.getBySlug = async (slug) => {
  const doc = await Product.findOne({ slug })
    .populate("categoryId", "name")
    .populate("brandId", "name");

  if (!doc) throw new Error("PRODUCT_NOT_FOUND");

  return await enrichProductPromotion(doc);
};

exports.list = async (query) => {
  const {
    q,
    page = 1,
    limit = 20,
    gender,
  } = query;

  const filter = {};

  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  if (gender) {
    filter.gender = gender;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
  };
};