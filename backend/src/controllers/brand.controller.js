const Brand = require("../models/Brand");
const slugify = require("../utils/slugify");

// GET ALL
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ createdAt: -1 });
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ONE
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand)
            return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE
exports.createBrand = async (req, res) => {
    try {
        const { name, description, logo } = req.body;

        const exist = await Brand.findOne({ name });
        if (exist)
            return res.status(400).json({ message: "Thương hiệu đã tồn tại" });

        const brand = await Brand.create({
            name,
            slug: slugify(name),
            description,
            logo,
        });

        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.updateBrand = async (req, res) => {
    try {
        const { name, description, logo } = req.body;

        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            {
                name,
                slug: slugify(name),
                description,
                logo,
            },
            { new: true }
        );

        if (!brand)
            return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);

        if (!brand)
            return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

        res.json({ message: "Xoá thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
