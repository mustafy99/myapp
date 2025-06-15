const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyJwt = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "❌ غير مصرح! التوكن مفقود أو غير صحيح." });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "❌ التوكن غير صالح أو منتهي الصلاحية!" });
            }
        
            req.user = decoded.UserInfo.id;
            req.userRole = decoded.UserInfo.role;
            next();
        });

    } catch (err) {
        return res.status(500).json({ message: "❌ خطأ في التحقق من التوكن" });
    }
};

const IsAdmin = (req, res, next) => {
    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "غير مسموح لك برؤية هذا المحتوى" });
    }
    next();
};

const IsAdminOrSupervisor = (req, res, next) => {
    if (req.userRole !== "admin" && req.userRole !== "supervisor") {
        return res.status(403).json({ message: "غير مسموح لك برؤية هذا المحتوى" });
    }
    next();
};

module.exports = {
    verifyJwt,
    IsAdmin,
    IsAdminOrSupervisor
};