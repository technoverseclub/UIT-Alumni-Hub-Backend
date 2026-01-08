const prisma = require("../../utils/prisma");
const { getExpiryTime } = require("../../utils/otp");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

exports.requestSignupOTP = async ({ email, otp }) => {
  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) throw new Error("User already exists");

  await prisma.otp.deleteMany({ where: { email } });

  await prisma.otp.create({
    data: { email, otp, expiresAt: getExpiryTime() },
  });
};

exports.verifySignupOTP = async (data) => {
  const record = await prisma.otp.findFirst({
    where: { email: data.email, otp: data.otp },
  });

  if (!record || record.expiresAt < new Date())
    throw new Error("Invalid OTP");

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: await hashPassword(data.password),
      role: data.role,
    },
  });

  await prisma.otp.deleteMany({ where: { email: data.email } });
};

exports.loginUser = async (email, password, otp) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password)))
    throw new Error("Invalid credentials");

  await prisma.otp.deleteMany({ where: { email } });

  await prisma.otp.create({
    data: { email, otp, expiresAt: getExpiryTime() },
  });
};

exports.verifyLoginOTP = async (email, otp) => {
  const record = await prisma.otp.findFirst({
    where: { email, otp },
  });

  if (!record || record.expiresAt < new Date())
    throw new Error("Invalid OTP");

  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.otp.deleteMany({ where: { email } });

  return {
    token: generateToken({ id: user.id, role: user.role }),
    role: user.role,
  };
};



// Save OTP for password reset
exports.requestForgotPasswordOTP = async ({ email, otp }) => {
  // 1️⃣ Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User does not exist");

   await prisma.otpCode.deleteMany({ where: { userId: user.id } });

  // 2️⃣ Save OTP
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      otp: otp,
      purpose: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expire
      isUsed: false,
    }
  });

  return true;
};

// Verify OTP and update password
exports.verifyForgotPasswordOTP = async (email, otp, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      otp: otp,
      purpose: "RESET_PASSWORD",
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) throw new Error("Invalid or expired OTP");

  // 1️⃣ Update password (hash it)
  const hashed = await hashPassword(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // 2️⃣ Mark OTP used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return true;
};
