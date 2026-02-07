const prisma = require("../../utils/prisma");
const imagekit = require("../utils/imagekit");

exports.createProfile = async (userId, data, file) => {
  const { phone, batch, branch, company, position } = data;

  // 🚨 HARD validation
  if (!phone || !batch || !branch || !company || !position) {
    throw new Error("All required fields must be filled");
  }
  const exists = await prisma.alumniProfile.findUnique({
    where: { userId },
  });

  if (!data.phone || !data.batch || !data.branch) {
    throw new Error("Phone, batch and branch are required");
  }
  if (exists) throw new Error("Profile already exists");

  let imageUrl = null;

  // 1️⃣ Upload image if provided
  if (file) {
    const upload = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `alumni_${userId}.jpg`,
      folder: "/alumni-profiles",
    });

    imageUrl = upload.url;
  }

  return prisma.alumniProfile.create({
    data: {
      userId,
      phone: data.phone,
      batch: Number(data.batch),
      branch: data.branch,
      company: data.company,
      position: data.position,
      linkedin: data.linkedin || null,
      bio: data.bio || null,
      imageUrl,
      isComplete: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.alumniProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

exports.updateProfile = async (userId, data, file) => {
  const existing = await prisma.alumniProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error("Profile does not exist");
  }

  let imageUrl = existing.imageUrl;

  if (file) {
    const upload = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `alumni_${userId}_${Date.now()}.jpg`,
      folder: "/alumni-profiles",
    });

    imageUrl = upload.url;
  }

  // Merge old + new values
  const merged = {
    phone: data.phone ?? existing.phone,
    batch: data.batch ? Number(data.batch) : existing.batch,
    branch: data.branch ?? existing.branch,
    company: data.company ?? existing.company,
    position: data.position ?? existing.position,
  };

  // 🔑 recompute completeness
  const isComplete = Boolean(
    merged.phone &&
    merged.batch &&
    merged.branch &&
    merged.company &&
    merged.position,
  );

  return prisma.alumniProfile.update({
    where: { userId },
    data: {
      ...merged,
      linkedin: data.linkedin ?? existing.linkedin,
      bio: data.bio ?? existing.bio,
      imageUrl,
      isComplete,
    },
  });
};

exports.deleteProfile = async (userId) => {
  return prisma.alumniProfile.delete({
    where: { userId },
  });
};

exports.getAllAlumni = async () => {
  return prisma.alumniProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

exports.getAlumniById = async (id) => {
  return prisma.alumniProfile.findFirst({
    where: { userId: Number(id) },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });
};
