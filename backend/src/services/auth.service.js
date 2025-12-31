const prisma = require("../../utils/prisma");
const { generateOTP, getExpiryTime } = require("../../utils/otp");
const { sendOTP } = require("../../utils/email");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

exports.requestSignupOTP = async (data) => {
  const exists = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (exists) throw new Error("User already exists");

  const otp = generateOTP();

  await prisma.otp.deleteMany({ where: { email: data.email } });
  await prisma.otp.create({
    data: { email: data.email, otp, expiresAt: getExpiryTime() },
  });

  await sendOTP(data.email, otp);
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

exports.loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password)))
    throw new Error("Invalid credentials");

  const otp = generateOTP();
  await prisma.otp.deleteMany({ where: { email } });
  await prisma.otp.create({
    data: { email, otp, expiresAt: getExpiryTime() },
  });

  await sendOTP(email, otp);
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
