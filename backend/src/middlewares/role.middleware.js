exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role?.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
