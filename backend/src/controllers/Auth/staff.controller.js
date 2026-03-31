const User = require("../../models/User");

function getUserIdFromReq(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

exports.getStaffProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const user = await User.findById(userId).select("-password -resetToken -resetTokenExpire");

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    if (!["staff", "admin"].includes(user.role)) {
      return res.status(403).json({
        ok: false,
        message: "Bạn không có quyền truy cập khu vực nhân viên",
      });
    }

    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy thông tin nhân viên",
      error: error.message,
    });
  }
};

exports.updateStaffProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    if (!["staff", "admin"].includes(currentUser.role)) {
      return res.status(403).json({
        ok: false,
        message: "Bạn không có quyền truy cập khu vực nhân viên",
      });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "gender",
      "address",
      "avatar",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -resetToken -resetTokenExpire");

    return res.status(200).json({
      ok: true,
      message: "Cập nhật hồ sơ nhân viên thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật hồ sơ nhân viên",
      error: error.message,
    });
  }
};