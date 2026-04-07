const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    author: {
      type: String,
      trim: true,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    comments: {
      type: [commentSchema],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);