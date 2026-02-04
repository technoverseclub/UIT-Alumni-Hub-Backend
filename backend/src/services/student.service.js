const prisma = require("../../utils/prisma");

exports.createProfile = async (userId, data) => {
  const exists = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (exists) throw new Error("Profile already exists");

  return prisma.studentProfile.create({
    data: {
      userId,
      branch: data.branch,
      year: Number(data.year),
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
};

exports.updateProfile = async (userId, data) => {
  return prisma.studentProfile.update({
    where: { userId },
    data: {
      branch: data.branch,
      year: Number(data.year),
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
