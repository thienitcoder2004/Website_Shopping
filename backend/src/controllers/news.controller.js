const mongoose = require("mongoose");
const News = require("../models/News");
const slugify = require("../utils/slugify");

async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title || "tin-tuc", {
    lower: true,
    strict: true,
  });

  let slug = baseSlug || `tin-tuc-${Date.now()}`;
  let count = 1;

  while (true) {
    const existing = await News.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${count}`;
    count += 1;
  }
}

function mapImages(files) {
  if (!Array.isArray(files)) return [];
  return files.map((file) => `/uploads/${file.filename}`);
}

exports.createNews = async (req, res) => {
  try {
    const { title, content, author, isPublished } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        ok: false,
        message: "Tiêu đề là bắt buộc",
      });
    }

    const slug = await generateUniqueSlug(title);
    const images = mapImages(req.files);

    const news = await News.create({
      title: String(title).trim(),
      slug,
      content: content || "",
      author: author || "",
      isPublished:
        typeof isPublished === "undefined"
          ? true
          : String(isPublished) === "true" || isPublished === true,
      thumbnail: images[0] || "",
      images,
    });

    return res.status(201).json({
      ok: true,
      message: "Tạo tin tức thành công",
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.getNews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
    const skip = (page - 1) * limit;

    const isPublished = req.query.isPublished;
    const keyword = String(req.query.q || "").trim();

    const filter = {};

    if (typeof isPublished !== "undefined") {
      filter.isPublished =
        String(isPublished) === "true" || isPublished === true;
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }

    const [total, news] = await Promise.all([
      News.countDocuments(filter),
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.status(200).json({
      ok: true,
      data: news,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID không hợp lệ",
      });
    }

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy bài viết",
      });
    }

    return res.status(200).json({
      ok: true,
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy bài viết",
      });
    }

    news.views += 1;
    await news.save();

    return res.status(200).json({
      ok: true,
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, isPublished } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID không hợp lệ",
      });
    }

    const existingNews = await News.findById(id);

    if (!existingNews) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const nextTitle =
      typeof title === "string" && title.trim()
        ? title.trim()
        : existingNews.title;

    const slug = await generateUniqueSlug(nextTitle, id);
    const images = mapImages(req.files);

    const updateData = {
      title: nextTitle,
      slug,
      content: typeof content === "string" ? content : existingNews.content,
      author: typeof author === "string" ? author : existingNews.author,
    };

    if (typeof isPublished !== "undefined") {
      updateData.isPublished =
        String(isPublished) === "true" || isPublished === true;
    }

    if (images.length > 0) {
      updateData.images = images;
      updateData.thumbnail = images[0];
    }

    const news = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      ok: true,
      message: "Cập nhật tin tức thành công",
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID không hợp lệ",
      });
    }

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy bài viết",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xóa thành công",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID không hợp lệ",
      });
    }

    if (!String(name || "").trim() || !String(message || "").trim()) {
      return res.status(400).json({
        ok: false,
        message: "Tên và nội dung bình luận là bắt buộc",
      });
    }

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy bài viết",
      });
    }

    news.comments.unshift({
      name: String(name).trim(),
      message: String(message).trim(),
    });

    await news.save();

    return res.status(201).json({
      ok: true,
      message: "Thêm bình luận thành công",
      data: news.comments,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Server error",
    });
  }
};