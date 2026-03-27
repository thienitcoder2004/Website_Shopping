const mongoose = require("mongoose");

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

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
      enum: ["user", "staff", "admin"],
      default: "user",
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "user";
      },
      validate: {
        validator: function (value) {
          if (this.role !== "user") return true;
          if (!value) return false;
          return calculateAge(value) >= 16;
        },
        message: "Bạn phải đủ 16 tuổi để tạo tài khoản",
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },

    shoppingPreference: {
      type: String,
      enum: ["male", "female", "both"],
      default: "both",
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