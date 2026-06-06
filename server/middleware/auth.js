const jwt = require("jsonwebtoken");
const Users = require("../models/users");

async function authenticate(req, res, next) {
    // Extract Bearer token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

    // Reject requests with no token
    if (!token) {
        return res.status(401).json({ code: "UNAUTHORIZED" });
    }

    let payload;
    try {
        // Verify signature and expiry — throws if invalid or expired
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // Invalid or expired token
        return res.status(401).json({ code: "UNAUTHORIZED" });
    }

    try {
        // DB가 교체된 뒤 남은 토큰으로 FK 오류가 발생하지 않도록 사용자를 확인한다.
        // Confirm the token owner still exists to prevent foreign-key errors after a DB reset.
        const user = await Users.findById(payload.sub);
        if (!user) {
            return res.status(401).json({
                code: "SESSION_EXPIRED",
                message: "Your session is no longer valid. Please log in again."
            });
        }

        req.user = { ...payload, sub: user.id };
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = authenticate;
