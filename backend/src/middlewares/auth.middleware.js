const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res.status(401).json({ message: "Chưa đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ message: "Không có quyền" });

    next();
};
