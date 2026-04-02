const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// GENERATE JWT TOKEN
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const calculateAge = (dateOfBirth) => {
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
};

const isAtLeast16 = (dateOfBirth) => {
  return calculateAge(dateOfBirth) >= 16;
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
      confirmPassword
    } = req.body;

    // VALIDATE
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

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu không khớp",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashed,
      role: "user",
      provider: "local",
    });

    return res.json({
      message: "Đăng ký thành công",
      token: generateToken(user),
      user: user,
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Sai email" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
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
        address: user.address,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        shoppingPreference: user.shoppingPreference,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới",
      });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu cũ" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.log("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// SEND RESET EMAIL
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();
  console.log("SMTP READY");

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset mật khẩu",
    html: `
      <h3>Reset mật khẩu</h3>
      <p>Click link bên dưới để đổi mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link hết hạn sau 10 phút</p>
    `,
  });
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendResetEmail(normalizedEmail, resetToken);

    return res.json({ message: "Đã gửi email reset mật khẩu" });
  } catch (err) {
    console.log("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới" });
    }

    const user = await User.findOne({
      resetToken: token,
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    if (!user.resetTokenExpire || user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: "Token đã hết hạn" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = "";
    user.resetTokenExpire = null;

    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.log("RESET ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};