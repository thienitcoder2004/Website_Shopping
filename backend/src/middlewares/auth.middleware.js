const jwt = require("jsonwebtoken");

function extractToken(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
}

exports.protect = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: "Chưa đăng nhập",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      id: decoded.id || decoded._id || decoded.userId || null,
      _id: decoded._id || decoded.id || decoded.userId || null,
      userId: decoded.userId || decoded.id || decoded._id || null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token không hợp lệ",
    });
  }
};

exports.verifyToken = exports.protect;

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      ok: false,
      message: "Chỉ admin mới có quyền truy cập",
    });
  }

  return next();
};

exports.staffOrAdmin = (req, res, next) => {
  if (!req.user || !["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({
      ok: false,
      message: "Chỉ admin hoặc nhân viên mới có quyền truy cập",
    });
  }

  return next();
};

exports.checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Chưa đăng nhập",
      });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(500).json({
        ok: false,
        message: "Cấu hình phân quyền không hợp lệ",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    return next();
  };
};