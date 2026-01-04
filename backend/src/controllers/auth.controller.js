const authService = require("../services/auth.service");

const sendEmail = require("../utils/email");
const { generateOTP } = require("../utils/otp");

const otp = generateOTP();

await sendEmail({
  to: user.email,
  subject: "OTP Verification",
  text: `Your OTP is ${otp}`,
});

exports.signupRequestOTP = async (req, res) => {
  try {
    await authService.requestSignupOTP(req.body);
    res.json({ message: "OTP sent" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.signupVerify = async (req, res) => {
  try {
    await authService.verifySignupOTP(req.body);
    res.json({ message: "Signup successful" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    await authService.loginUser(req.body.email, req.body.password);
    res.json({ message: "OTP sent" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.loginVerify = async (req, res) => {
  try {
    res.json(
      await authService.verifyLoginOTP(req.body.email, req.body.otp)
    );
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

