const slugify = require("../utils/slugify");
const Product = require("../models/Product");

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

exports.list = async ({ q, page = 1, limit = 10, isActive }) => {
    const filter = {};
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true" || isActive === true;

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

    return {
        items,
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
    return doc;
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
        const baseSlug = payload.slug ? slugify(payload.slug) : slugify(payload.name || current.name);
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
    return doc;
};
