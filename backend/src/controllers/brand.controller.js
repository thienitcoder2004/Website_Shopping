const Brand = require("../models/Brand");
const slugify = require("../utils/slugify");

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      brands,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách thương hiệu",
      error: error.message,
    });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy thương hiệu",
      });
    }

    return res.status(200).json({
      ok: true,
      brand,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy chi tiết thương hiệu",
      error: error.message,
    });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: "Tên thương hiệu là bắt buộc",
      });
    }

    const normalizedName = String(name).trim();

    const exist = await Brand.findOne({ name: normalizedName });
    if (exist) {
      return res.status(400).json({
        ok: false,
        message: "Thương hiệu đã tồn tại",
      });
    }

    const brand = await Brand.create({
      name: normalizedName,
      slug: slugify(normalizedName),
      description: description || "",
      logo: logo || "",
    });

    return res.status(201).json({
      ok: true,
      message: "Tạo thương hiệu thành công",
      brand,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi tạo thương hiệu",
      error: error.message,
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    const currentBrand = await Brand.findById(req.params.id);
    if (!currentBrand) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy thương hiệu",
      });
    }

    const nextName =
      typeof name === "string" && name.trim() ? name.trim() : currentBrand.name;

    const duplicate = await Brand.findOne({
      name: nextName,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        ok: false,
        message: "Tên thương hiệu đã tồn tại",
      });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: nextName,
        slug: slugify(nextName),
        description:
          typeof description === "string"
            ? description
            : currentBrand.description || "",
        logo: typeof logo === "string" ? logo : currentBrand.logo || "",
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      ok: true,
      message: "Cập nhật thương hiệu thành công",
      brand,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật thương hiệu",
      error: error.message,
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy thương hiệu",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xóa thương hiệu thành công",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xóa thương hiệu",
      error: error.message,
    });
  }
};