const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/sales/Order");
const Contact = require("../../models/Contact");

function buildKeywordQuery(keyword) {
  if (!keyword) return {};

  return {
    $or: [
      { email: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword, $options: "i" } },
      { firstName: { $regex: keyword, $options: "i" } },
      { lastName: { $regex: keyword, $options: "i" } },
    ],
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetToken;
  delete obj.resetTokenExpire;
  return obj;
}

exports.getUsers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const users = await User.find({
      role: "user",
      ...buildKeywordQuery(keyword),
    })
      .select("-password -resetToken -resetTokenExpire")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      shoppingPreference,
      address,
      avatar,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email và mật khẩu là bắt buộc",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        ok: false,
        message: "Người dùng phải có ngày sinh",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) {
      return res.status(400).json({
        ok: false,
        message: "Email đã tồn tại",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName || "",
      lastName: lastName || "",
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      phone: phone || "",
      dateOfBirth,
      gender: gender || "prefer_not_to_say",
      shoppingPreference: shoppingPreference || "both",
      address: address || "",
      avatar: avatar || "/uploads/default-avatar.png",
      provider: "local",
    });

    return res.status(201).json({
      ok: true,
      message: "Tạo người dùng thành công",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi tạo người dùng",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "shoppingPreference",
      "address",
      "avatar",
      "isActive",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "user" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpire");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cập nhật người dùng thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật người dùng",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xóa người dùng",
      error: error.message,
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "user" });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy người dùng",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      ok: true,
      message: `${user.isActive ? "Mở khóa" : "Khóa"} người dùng thành công`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật trạng thái người dùng",
      error: error.message,
    });
  }
};

exports.getStaffs = async (req, res) => {
  try {
    const { keyword } = req.query;

    const staffs = await User.find({
      role: "staff",
      ...buildKeywordQuery(keyword),
    })
      .select("-password -resetToken -resetTokenExpire")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      staffs,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      address,
      avatar,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email và mật khẩu là bắt buộc",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const exist = await User.findOne({ email: normalizedEmail });
    if (exist) {
      return res.status(400).json({
        ok: false,
        message: "Email đã tồn tại",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staff = await User.create({
      firstName: firstName || "",
      lastName: lastName || "",
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
      phone: phone || "",
      gender: gender || "prefer_not_to_say",
      address: address || "",
      avatar: avatar || "/uploads/default-avatar.png",
      provider: "local",
    });

    return res.status(201).json({
      ok: true,
      message: "Tạo nhân viên thành công",
      staff: sanitizeUser(staff),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi tạo nhân viên",
      error: error.message,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "gender",
      "address",
      "avatar",
      "isActive",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpire");

    if (!staff) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cập nhật nhân viên thành công",
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật nhân viên",
      error: error.message,
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xóa nhân viên",
      error: error.message,
    });
  }
};

exports.toggleStaffStatus = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: "staff" });

    if (!staff) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    return res.status(200).json({
      ok: true,
      message: `${staff.isActive ? "Mở khóa" : "Khóa"} nhân viên thành công`,
      staff: sanitizeUser(staff),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật trạng thái nhân viên",
      error: error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, staffs, products, orders, contacts] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "staff" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Contact.countDocuments(),
    ]);

    return res.status(200).json({
      ok: true,
      data: {
        users,
        staffs,
        products,
        orders,
        contacts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy thống kê dashboard",
      error: error.message,
    });
  }
};