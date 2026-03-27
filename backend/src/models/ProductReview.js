const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductReview",
      default: null,
      index: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    helpfulCount: {
      type: Number,
      default: 0,
    },

    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    replyCount: {
      type: Number,
      default: 0,
    },

    hasStaffReply: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductReview", ProductReviewSchema);