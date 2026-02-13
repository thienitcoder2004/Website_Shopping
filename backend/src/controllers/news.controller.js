const News = require("../models/News");
const slugify = require("../utils/slugify");

// ================= CREATE =================
exports.createNews = async (req, res) => {
    try {
        const { title, content, author } = req.body;

        const slug = slugify(title, { lower: true, strict: true });

        const images = req.files?.map(
            (file) => `/uploads/${file.filename}`
        );

        const news = await News.create({
            title,
            slug,
            content,
            author,
            thumbnail: images?.[0],
            images,
        });

        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= READ ALL (PAGINATION) =================
exports.getNews = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const total = await News.countDocuments();
    const news = await News.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        data: news,
        totalPages: Math.ceil(total / limit),
    });
};

// ================= READ ONE =================
exports.getNewsById = async (req, res) => {
    const news = await News.findById(req.params.id);
    res.json(news);
};

// ================= READ BY SLUG =================
exports.getNewsBySlug = async (req, res) => {
    const news = await News.findOne({ slug: req.params.slug });

    if (!news) return res.status(404).json({ message: "Not found" });

    news.views += 1;
    await news.save();

    res.json(news);
};

// ================= UPDATE =================
exports.updateNews = async (req, res) => {
    try {
        const { title, content, author } = req.body;

        const slug = slugify(title, { lower: true, strict: true });

        const images = req.files?.map(
            (file) => `/uploads/${file.filename}`
        );

        const updateData = {
            title,
            slug,
            content,
            author,
        };

        if (images?.length) {
            updateData.images = images;
            updateData.thumbnail = images[0];
        }

        const news = await News.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= DELETE =================
exports.deleteNews = async (req, res) => {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa thành công" });
};
