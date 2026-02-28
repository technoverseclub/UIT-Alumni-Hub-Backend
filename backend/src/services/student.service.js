const prisma = require("../../utils/prisma");

exports.createProfile = async (userId, data) => {
  const exists = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (exists) throw new Error("Profile already exists");

  const isComplete = Boolean(
    data.branch &&
    data.year
  );

  return prisma.studentProfile.create({
    data: {
      userId,
      branch: data.branch,
      year: Number(data.year),
      isComplete,
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
};

exports.updateProfile = async (userId, data) => {
  const merged = {
    branch: data.branch,
    year: Number(data.year),
  };

  const isComplete = Boolean(
    merged.branch &&
    merged.year
  );

  return prisma.studentProfile.update({
    where: { userId },
    data: {
      ...merged,
      isComplete,
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
