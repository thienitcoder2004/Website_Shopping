const jwt = require("jsonwebtoken");

// exports.protect = (req, res, next) => {
//     let token;

//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith("Bearer")
//     ) {
//         token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//         return res.status(401).json({ message: "Chưa đăng nhập" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         req.user = decoded; // { id, role }
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: "Token không hợp lệ" });
//     }
// };

exports.protect = (req, res, next) => {
    let token;

    console.log("HEADERS:", req.headers);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    console.log("TOKEN:", token);

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        console.log("VERIFY ERROR:", error.message);
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};


exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    next();
};

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập",
            });
        }
        next();
    };
};

