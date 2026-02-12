const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        email: { type: String, unique: true },
        phone: String,
        password: String,

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
        },

        resetToken: String,
        resetTokenExpire: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);