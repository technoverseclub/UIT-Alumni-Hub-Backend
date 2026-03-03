const prisma = require("../../utils/prisma");
const imagekit = require("../utils/imagekit");

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

  let imageUrl = null;

  // Upload image
  if (file) {
    const upload = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `student_${userId}.jpg`,
      folder: "/student-profiles",
    });

    imageUrl = upload.url;
  }

  if (!imageUrl) {
    throw new Error("Image upload failed");
  }

  return prisma.studentProfile.create({
    data: {
      userId,
      phone: data.phone,
      linkedin: data.linkedin,
      bio: data.bio,
      branch: data.branch,
      year: Number(data.year), // prevents NaN issue
      imageUrl,
      isComplete: true,
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
     include: {
      user: true,
    },
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
