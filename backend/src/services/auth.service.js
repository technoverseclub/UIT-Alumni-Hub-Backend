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

  // 2️⃣ Save OTP
  await prisma.otp.create({
    data: {
      user_id: user.id,
      otp: otp,
      purpose: "RESET_PASSWORD",
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min expire
    }
  });

  return true;
};

// Verify OTP and update password
exports.verifyForgotPasswordOTP = async (email, otp, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otpRecord = await prisma.otp.findFirst({
    where: {
      user_id: user.id,
      otp: otp,
      purpose: "RESET_PASSWORD",
      is_used: false,
      expires_at: { gt: new Date() },
    },
  });

  if (!otpRecord) throw new Error("Invalid or expired OTP");

  // 1️⃣ Update password (hash it)
  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // 2️⃣ Mark OTP used
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { is_used: true },
  });

  return true;
};
