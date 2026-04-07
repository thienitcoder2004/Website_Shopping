const mongoose = require("mongoose");
const Category = require("../models/Category");
const slugify = require("../utils/slugify");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await Category.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();

    if (!existing) return slug;

    slug = `${baseSlug}-${count}`;
    count += 1;
  }
}

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parentId, isActive } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: "Tên danh mục là bắt buộc",
      });
    }

    if (parentId && !isValidObjectId(parentId)) {
      return res.status(400).json({
        ok: false,
        message: "Danh mục cha không hợp lệ",
      });
    }

    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({
          ok: false,
          message: "Không tìm thấy danh mục cha",
        });
      }
    }

    const normalizedName = String(name).trim();
    const baseSlug = slugify(normalizedName);
    const slug = await ensureUniqueSlug(baseSlug);

    const category = await Category.create({
      name: normalizedName,
      slug,
      description: description || "",
      image: image || "",
      parentId: parentId || null,
      isActive:
        typeof isActive === "undefined"
          ? true
          : String(isActive) === "true" || isActive === true,
    });

    return res.status(201).json({
      ok: true,
      message: "Tạo danh mục thành công",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi tạo danh mục",
      error: error.message,
    });
  }
};

// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const { isActive, keyword } = req.query;

    const filter = {};

    if (typeof isActive !== "undefined") {
      filter.isActive = String(isActive) === "true" || isActive === true;
    }

    if (keyword && String(keyword).trim()) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const categories = await Category.find(filter)
      .populate("parentId", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách danh mục",
      error: error.message,
    });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentId, isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID danh mục không hợp lệ",
      });
    }

    const currentCategory = await Category.findById(id);

    if (!currentCategory) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy danh mục",
      });
    }

    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({
          ok: false,
          message: "Danh mục cha không hợp lệ",
        });
      }

      if (String(parentId) === String(id)) {
        return res.status(400).json({
          ok: false,
          message: "Danh mục không thể là cha của chính nó",
        });
      }

      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({
          ok: false,
          message: "Không tìm thấy danh mục cha",
        });
      }
    }

    const nextName =
      typeof name === "string" && name.trim() ? name.trim() : currentCategory.name;

    const baseSlug = slugify(nextName);
    const slug = await ensureUniqueSlug(baseSlug, id);

    const updateData = {
      name: nextName,
      slug,
      description:
        typeof description === "string"
          ? description
          : currentCategory.description || "",
      image: typeof image === "string" ? image : currentCategory.image || "",
    };

    if (typeof parentId !== "undefined") {
      updateData.parentId = parentId || null;
    }

    if (typeof isActive !== "undefined") {
      updateData.isActive = String(isActive) === "true" || isActive === true;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("parentId", "name slug");

    return res.status(200).json({
      ok: true,
      message: "Cập nhật danh mục thành công",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật danh mục",
      error: error.message,
    });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID danh mục không hợp lệ",
      });
    }

    const hasChildren = await Category.exists({ parentId: id });
    if (hasChildren) {
      return res.status(400).json({
        ok: false,
        message: "Không thể xóa danh mục đang có danh mục con",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy danh mục",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xóa thành công",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xóa danh mục",
      error: error.message,
    });
  }
};