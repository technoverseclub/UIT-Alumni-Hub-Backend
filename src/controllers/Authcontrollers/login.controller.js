import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../prismaClient.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 2️⃣ Find user with roles
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 3️⃣ Compare password (IMPORTANT: password_hash)
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 4️⃣ Extract role names
  const roles = user.roles.map((r) => r.role.name);

  // 5️⃣ Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // 6️⃣ Set cookie (JWT stored here)
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "lax",
  });

  // 7️⃣ Send response
  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      roles,
      token,
    },
  });
});
