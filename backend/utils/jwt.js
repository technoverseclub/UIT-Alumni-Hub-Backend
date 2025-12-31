const jwt = require("jsonwebtoken");

exports.generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
