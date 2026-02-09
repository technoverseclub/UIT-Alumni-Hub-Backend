const jwt = require("jsonwebtoken");

exports.generateToken = (payload) =>
  jwt.sign(
    {
      ...payload,
      role: payload.role?.toUpperCase(), // force uppercase
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
