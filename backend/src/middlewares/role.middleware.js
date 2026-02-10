exports.requireRole = (role) => {
  return (req, res, next) => {
    console.log("ROLE CHECK:", req.user); // 👈 add this
    if (req.user.role?.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
