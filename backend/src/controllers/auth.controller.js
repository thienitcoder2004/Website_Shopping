const User = require("../models/User");
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

// REGISTER
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashed = await bcrypt.hash(password, 12);

        const role = email === "admin@gmail.com" ? "admin" : "user";

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashed,
            role,
            avatar: "",
        });

        res.json({
            message: "Đăng ký thành công",
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
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
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

        res.json({
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
            },
        });
    } catch (err) {
        console.log("LOGIN ERROR:", err);
        res.status(500).json({ message: err.message });
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

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ message: "Sai mật khẩu cũ" });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.log("CHANGE PASSWORD ERROR:", err);
        res.status(500).json({ message: err.message });
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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendResetEmail(email, resetToken);

        res.json({ message: "Đã gửi email reset mật khẩu" });
    } catch (err) {
        console.log("FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

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

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.log("RESET ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const { firstName, lastName, phone, address, avatar } = req.body;

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.json({
            message: "Cập nhật thành công",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};