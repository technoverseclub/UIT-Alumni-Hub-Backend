const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");
const { requireRole } = require("../middlewares/role.middleware");

router.post("/signup/request-otp", controller.signupRequestOTP);
router.post("/signup/verify", controller.signupVerify);
router.post("/login", controller.login);
router.post("/login/verify", controller.loginVerify);

//
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("STUDENT"),
  // studentController.dashboard,
);

router.get("/me", authMiddleware, authController.me);
module.exports = router;
