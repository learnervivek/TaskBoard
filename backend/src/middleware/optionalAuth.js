const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;

  // If no auth header, just continue (allows share token access)
  if (!auth) return next();

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    // If token is invalid, just continue (allows share token as fallback)
    next();
  }
};
