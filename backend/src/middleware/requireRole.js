function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.userProfile || !roles.includes(req.userProfile.role)) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }
    return next();
  };
}

module.exports = {
  requireRole
};
