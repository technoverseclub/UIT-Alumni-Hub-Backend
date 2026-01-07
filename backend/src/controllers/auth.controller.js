const authService = require("../services/auth.service");
const sendEmail = require("../../utils/email");
const { generateOTP } = require("../../utils/otp");

const otp = generateOTP();

exports.signupRequestOTP = async (req, res) => {
  try {
    // 1️⃣ Generate OTP
    const otp = generateOTP();

    // 2️⃣ Send email
    await sendEmail({
      to: req.body.email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    // 3️⃣ Save OTP via service
    await authService.requestSignupOTP({
      ...req.body,
      otp,
    });

    res.json({ message: "OTP sent" });
  } catch (e) {
    console.error(e);
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
    const otp = generateOTP(); // ✅ generate OTP here

    // ✅ send OTP email
    await sendEmail({
      to: req.body.email,
      subject: "Login OTP",
      text: `Your OTP is ${otp}`,
      html: `<h2>Your OTP is <b>${otp}</b></h2>`,
    });

    // ✅ pass otp to service
    await authService.loginUser(
      req.body.email,
      req.body.password,
      otp
    );

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

exports.forgotPasswordRequestOTP = async (req, res) => {
  try {
    const otp = generateOTP();

    await sendEmail({
      to: req.body.email,
      subject: "Password Reset OTP",
      text: `Your OTP to reset password is ${otp}`,
      html: `<h2>Your OTP to reset password is <b>${otp}</b></h2>`
    });

    await authService.requestForgotPasswordOTP({
      email: req.body.email,
      otp,
    });

    res.json({ message: "Reset OTP sent" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

exports.forgotPasswordVerify = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.verifyForgotPasswordOTP(email, otp, newPassword);

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};