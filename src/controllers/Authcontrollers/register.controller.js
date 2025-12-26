import bcrypt from "bcrypt";
import { prisma } from "../../prismaClient.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;

  // 1️⃣ Validation
  if (!full_name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // 2️⃣ Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // 3️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4️⃣ Find STUDENT role (seeded earlier)
  const studentRole = await prisma.role.findFirst({
    where: { name: "STUDENT" },
  });

  if (!studentRole) {
    throw new ApiError(500, "STUDENT role not found");
  }

  // 5️⃣ Create user + assign role
  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password_hash: hashedPassword,
      roles: {
        create: {
          role: {
            connect: { id: studentRole.id },
          },
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  // 6️⃣ Response
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    },
  });
});
