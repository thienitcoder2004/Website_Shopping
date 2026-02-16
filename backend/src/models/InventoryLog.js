const mongoose = require("mongoose");

const InventoryLogSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        type: { type: String, enum: ["IN", "OUT", "ADJUST"], required: true },
        qty: { type: Number, required: true, min: 1 },

        beforeWarehouse: { type: Number, required: true, min: 0 },
        afterWarehouse: { type: Number, required: true, min: 0 },

        beforeShop: { type: Number, required: true, min: 0 },
        afterShop: { type: Number, required: true, min: 0 },

        note: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

module.exports = mongoose.model("InventoryLog", InventoryLogSchema);
