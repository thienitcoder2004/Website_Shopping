const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    saleStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    perUserLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ productIds: 1, isActive: 1 });

module.exports = mongoose.model("Promotion", PromotionSchema);