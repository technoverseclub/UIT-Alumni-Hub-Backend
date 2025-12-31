const router = require("express").Router();
const controller = require("../controllers/auth.controller");

router.post("/signup/request-otp", controller.signupRequestOTP);
router.post("/signup/verify", controller.signupVerify);
router.post("/login", controller.login);
router.post("/login/verify", controller.loginVerify);

module.exports = router;
