const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    name: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, unique: true },
        content: String,
        thumbnail: String,
        images: [String],
        author: String,
        views: { type: Number, default: 0 },
        comments: [commentSchema],
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
