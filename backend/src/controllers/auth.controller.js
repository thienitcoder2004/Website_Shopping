const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
        if (exist) return res.status(400).json({ message: "Email đã tồn tại" });

        const hashed = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashed,
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
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Sai email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Sai mật khẩu" });

    res.json({
        token: generateToken(user),
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: "Sai mật khẩu cũ" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
};
