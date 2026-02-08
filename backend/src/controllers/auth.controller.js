const authService = require("../services/auth.service");
const sendEmail = require("../../utils/email");
const { generateOTP } = require("../../utils/otp");
const prisma = require("../../utils/prisma");

// const otp = generateOTP();

exports.signupRequestOTP = async (req, res) => {
  try {
    // 1️⃣ Generate OTP
    const otp = generateOTP();

    // 3️⃣ Save OTP via service
    await authService.requestSignupOTP({
      ...req.body,
      otp,
    });

    // 2️⃣ Send email
    await sendEmail({
      to: req.body.email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

exports.signupVerify = async (req, res) => {
  try {
    const result = await authService.verifySignupOTP(req.body);
    res.status(201).json({
      success: true,
      message: "Signup successful",
      token: result.token,
      role: result.role,
      user: result.user,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const otp = generateOTP(); // ✅ generate OTP here

    // ✅ pass otp to service
    await authService.loginUser(req.body.email, otp);

    // ✅ send OTP email
    await sendEmail({
      to: req.body.email,
      subject: "Login OTP",
      text: `Your OTP is ${otp}`,
      html: `<h2>Your OTP is <b>${otp}</b></h2>`,
    });

    res.json({ message: "OTP sent" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.loginVerify = async (req, res) => {
  try {
    res.json(await authService.verifyLoginOTP(req.body.email, req.body.otp));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        alumniProfile: true,
        studentProfile: true,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isProfileComplete:
        user.role === "ALUMNI"
          ? !!user.alumniProfile?.isComplete === true
          : true,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// exports.me = async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//       select: {
//         id: true,
//         email: true,
//         role: true,
//       },
//     });

//     res.json({
//       ...user,
//       isProfileComplete: user.role === "ALUMNI" ? false : true,
//     });
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// };
