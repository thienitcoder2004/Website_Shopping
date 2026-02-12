const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const { keyword } = req.query;

        let query = {
            email: { $ne: "admin@gmail.com" } // loại admin mặc định
        };

        if (keyword) {
            query = {
                ...query,
                $or: [
                    { email: { $regex: keyword, $options: "i" } },
                    { phone: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const users = await User.find(query).select("-password");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE USER
exports.createUser = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashed,
        role,
    });

    res.json(user);
};

// UPDATE USER
exports.updateUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
    }).select("-password");

    res.json(user);
};

// DELETE USER
exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa thành công" });
};

// TOGGLE LOCK ACCOUNT
exports.toggleUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id);

    user.isActive = !user.isActive;
    await user.save();

    res.json(user);
};

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({
            email: { $ne: "admin@gmail.com" }
        });

        const totalActiveUsers = await User.countDocuments({
            isActive: true,
            email: { $ne: "admin@gmail.com" }
        });

        res.json({
            totalUsers,
            totalActiveUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};