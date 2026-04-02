const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        sku: { type: String, trim: true, unique: true, sparse: true },

        description: { type: String, default: "" },

        price: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, default: 0, min: 0 },

        primaryImage: { type: String, default: "" },
        images: { type: [String], default: [] },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        brandId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
        },

        gender: {
            type: String,
            enum: ["nam", "nu", "unisex"],
            default: "unisex",
            index: true,
        },

        stock: { type: Number, default: 0, min: 0 },
        warehouseStock: { type: Number, default: 0, min: 0 },

        colors: { type: [String], default: [] },
        sizes: { type: [String], default: [] },

        ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount: { type: Number, default: 0, min: 0 },
        reviewCount: { type: Number, default: 0, min: 0 },

        isActive: { type: Boolean, default: true },
        sold: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);