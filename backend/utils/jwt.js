const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "mysupersecretkey";

const generateToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      role: payload.role?.toUpperCase(), // force uppercase
    },
    SECRET,
    { expiresIn: "7d" },
  );
};

// console.log("Verifying with secret:", process.env.JWT_SECRET);

const verifyToken = (token) => {
  // console.log("jwt.verify = ", jwt.verify(token, SECRET));
  return jwt.verify(token, SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
