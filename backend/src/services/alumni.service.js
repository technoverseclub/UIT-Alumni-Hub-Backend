const prisma = require("../../utils/prisma");
const imagekit = require("../utils/imagekit");

exports.createProfile = async (userId, data, file) => {
  const exists = await prisma.alumniProfile.findUnique({
    where: { userId },
  });
  if (exists) throw new Error("Profile already exists");

  let imageUrl = null;

  // 1️⃣ Upload image if provided
  if (file) {
    const upload = await imagekit.upload({
      file: file.buffer,
      fileName: `alumni_${userId}.jpg`,
      folder: "/alumni-profiles",
    });

    console.log("IMAGEKIT RESPONSE:", upload);

    imageUrl = upload.url;
  }

  console.log("SAVING imageUrl:", imageUrl);

  return prisma.alumniProfile.create({
    data: {
      userId,
      graduationYear: Number(data.graduationYear),
      company: data.company,
      position: data.position,
      bio: data.bio || null,
      imageUrl,
    },
  });
};

exports.getMyProfile = async (userId) => {
  return prisma.alumniProfile.findUnique({
    where: { userId },
  });
};

exports.updateProfile = async (userId, data, file) => {
  let imageUrl;

  if (file) {
    const upload = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `alumni_${userId}_${Date.now()}.jpg`,
      folder: "/alumni-profiles",
    });

    imageUrl = upload.url;
  }

  return prisma.alumniProfile.update({
    where: { userId },
    data: {
      graduationYear: data.graduationYear
        ? Number(data.graduationYear)
        : undefined,
      company: data.company,
      position: data.position,
      bio: data.bio,
      ...(imageUrl && { imageUrl }), // only update if new image
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
