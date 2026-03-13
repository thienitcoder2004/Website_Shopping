const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            default: "",
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        color: {
            type: String,
            default: "",
            trim: true,
        },
        size: {
            type: String,
            default: "",
            trim: true,
        },
        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        orderCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [OrderItemSchema],
            default: [],
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "MOMO"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["UNPAID", "PAID"],
            default: "UNPAID",
            index: true,
        },

        paymentNote: {
            type: String,
            default: "Chưa trả tiền",
            trim: true,
        },

        orderStatus: {
            type: String,
            enum: ["PENDING", "CANCELLED", "SUCCESS", "SHIPPING"],
            default: "PENDING",
            index: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true,
        },

        customerAddress: {
            type: String,
            required: true,
            trim: true,
        },

        note: {
            type: String,
            default: "",
            trim: true,
        },

        momo: {
            requestId: { type: String, default: "" },
            orderId: { type: String, default: "" },
            transId: { type: String, default: "" },
            resultCode: { type: Number, default: null },
            message: { type: String, default: "" },
            payUrl: { type: String, default: "" },
            deeplink: { type: String, default: "" },
            qrCodeUrl: { type: String, default: "" },
            responseTime: { type: Number, default: null },
            rawCallback: { type: mongoose.Schema.Types.Mixed, default: null },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);