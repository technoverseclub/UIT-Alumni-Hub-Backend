const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = (email, otp) =>
  transporter.sendMail({
    to: email,
    subject: "OTP Verification",
    text: `Your verification code is ${otp}. It expires in 5 minutes.`,
  });
