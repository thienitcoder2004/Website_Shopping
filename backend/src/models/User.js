const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        password: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["user", "employee", "admin"],
            default: "user",
        },

        provider: {
            type: String,
            enum: ["local", "google", "facebook"],
            default: "local",
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        avatar: {
            type: String,
            default: "/uploads/default-avatar.png",
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        resetToken: {
            type: String,
            default: "",
        },

        resetTokenExpire: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);