const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: "Chưa đăng nhập",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            message: "Token không hợp lệ",
        });
    }
};

exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            ok: false,
            message: "Không có quyền truy cập",
        });
    }

    next();
};

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                ok: false,
                message: "No token",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            ok: false,
            message: "Invalid token",
        });
    }
};

exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                ok: false,
                message: "Bạn không có quyền truy cập",
            });
        }

        next();
    };
};