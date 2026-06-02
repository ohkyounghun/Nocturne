const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    // Extract Bearer token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

    // Reject requests with no token
    if (!token) {
        return res.status(401).json({ code: "UNAUTHORIZED" });
    }

    try {
        // Verify signature and expiry — throws if invalid or expired
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded claims to req.user for downstream route handlers
        req.user = payload;
        return next();
    } catch {
        // Invalid or expired token
        return res.status(401).json({ code: "UNAUTHORIZED" });
    }
}

module.exports = authenticate;