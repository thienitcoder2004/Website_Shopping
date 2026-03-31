const User = require("../../models/User");

function getUserIdFromReq(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

exports.getProfile = async (req, res) => {
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
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy thông tin cá nhân",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "shoppingPreference",
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

    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật hồ sơ",
      error: error.message,
    });
  }
};