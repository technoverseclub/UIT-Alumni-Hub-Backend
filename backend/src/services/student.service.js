const prisma = require("../../utils/prisma");

exports.createProfile = async (userId, data, file) => {

  // 🔥 Required fields validation
  if (
    !data.phone ||
    !data.linkedin ||
    !data.bio ||
    !data.branch ||
    !data.year ||
    !file
  ) {
    throw new Error("All fields including image are required");
  }

  const exists = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (exists) {
    throw new Error("Profile already exists");
  }

  return prisma.studentProfile.create({
    data: {
      userId,
      phone: data.phone,
      linkedin: data.linkedin,
      bio: data.bio,
      branch: data.branch,
      year: Number(data.year),   // 🔥 prevents NaN issue
      imageUrl: file.originalname, // or file.filename / uploaded URL
      isComplete: true,
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
};

exports.updateProfile = async (userId, data, file) => {

  if (
    !data.phone ||
    !data.linkedin ||
    !data.bio ||
    !data.branch ||
    !data.year
  ) {
    throw new Error("All fields are required");
  }

  return prisma.studentProfile.update({
    where: { userId },
    data: {
      phone: data.phone,
      linkedin: data.linkedin,
      bio: data.bio,
      branch: data.branch,
      year: Number(data.year),
      imageUrl: file ? file.originalname : undefined,
      isComplete: true,
    },
  });
};

exports.getDashboard = async (userId) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  const alumniCount = await prisma.alumniProfile.count();

  return {
    profile,
    alumniCount,
  };
};