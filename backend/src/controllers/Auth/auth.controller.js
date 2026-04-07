const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// VALIDATE
const isValidGmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
};

const isValidPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
};

// GENERATE TOKEN
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    // CHECK EMPTY
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // EMAIL
    if (!isValidGmail(email)) {
      return res.status(400).json({
        message: "Email phải là @gmail.com",
      });
    }

    // PASSWORD RULE
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Mật khẩu ≥6 ký tự, có chữ hoa, chữ thường và số",
      });
    }

    // CONFIRM
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu không khớp",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // CHECK EMAIL TỒN TẠI
    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // CREATE USER
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "user",
      provider: "local",
    });

    return res.json({
      message: "Đăng ký thành công 🎉",
      token: generateToken(user),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidGmail(email)) {
      return res.status(400).json({
        message: "Email phải là @gmail.com",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        message: "Sai email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Sai mật khẩu",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa",
      });
    }

    return res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy user",
      });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Sai mật khẩu cũ",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (err) {
    console.log("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.json({
      message: "Token reset đã tạo (test)",
      token,
    });
  } catch (err) {
    console.log("FORGOT ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ",
      });
    }

    if (user.resetTokenExpire < Date.now()) {
      return res.status(400).json({
        message: "Token hết hạn",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = "";
    user.resetTokenExpire = null;

    await user.save();

    return res.json({
      message: "Reset mật khẩu thành công",
    });
  } catch (err) {
    console.log("RESET ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};