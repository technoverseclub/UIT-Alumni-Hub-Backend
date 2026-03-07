const prisma = require("../../utils/prisma");

/* =====================================================
   UTILS
===================================================== */

const buildPairKey = (id1, id2) => {
  return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
};

/* =====================================================
   CREATE OR GET CONVERSATION (PRODUCTION SAFE)
===================================================== */

const createOrGetConversation = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new Error("Cannot chat with yourself");
  }

  // Validate users
  const users = await prisma.user.findMany({
    where: { id: { in: [currentUserId, targetUserId] } },
  });

  if (users.length !== 2) {
    throw new Error("User not found");
  }

  const user1 = users.find((u) => u.id === currentUserId);
  const user2 = users.find((u) => u.id === targetUserId);

  const validPair =
    (user1.role === "STUDENT" && user2.role === "ALUMNI") ||
    (user1.role === "ALUMNI" && user2.role === "STUDENT");

  if (!validPair) {
    throw new Error("Only student to alumni chat allowed");
  }

  const pairKey = buildPairKey(currentUserId, targetUserId);

  // ⭐ UPSERT = NO DUPLICATE + RACE CONDITION SAFE
  return prisma.conversation.upsert({
    where: { userPairKey: pairKey },
    update: {},
    create: {
      userPairKey: pairKey,
      participants: {
        create: [
          { userId: currentUserId },
          { userId: targetUserId },
        ],
      },
    },
    include: {
      participants: true,
    },
  });
};

/* =====================================================
   GET MESSAGES
===================================================== */

const getMessages = async (conversationId, userId) => {
  const isParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });

  if (!isParticipant) {
    throw new Error("Unauthorized");
  }

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/* =====================================================
   GET USER CONVERSATIONS
===================================================== */

const getUserConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              alumniProfile: {
                select: {
                  batch: true,
                  branch: true,
                  imageUrl: true,
                },
              },
              studentProfile: {
                select: {
                  branch: true,
                  year: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  // 🔥 ADD THIS PART
  return conversations.map((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== userId
    );

    const user = otherParticipant.user;

    const profile =
      user.role === "STUDENT"
        ? user.studentProfile
        : user.alumniProfile;

    return {
      id: conv.id,
      lastMessageAt: conv.lastMessageAt,
      lastMessage: conv.messages[0] || null,

      otherUser: {
        id: user.id,
        name: user.name,
        role: user.role,
        branch: profile?.branch || null,
        batch: profile?.batch || profile?.year || null,
        imageUrl: profile?.imageUrl || null,
      },
    };
  });
};

/* =====================================================
   SEND MESSAGE (FULL PRO SAFE)
===================================================== */

const sendMessage = async (senderId, targetUserId, content) => {
  if (!content?.trim()) {
    throw new Error("Message content is required");
  }

  if (senderId === targetUserId) {
    throw new Error("Cannot message yourself");
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: [senderId, targetUserId] },
    },
  });

  if (users.length !== 2) {
    throw new Error("User not found");
  }

  const sender = users.find((u) => u.id === senderId);
  const target = users.find((u) => u.id === targetUserId);

  const validPair =
    (sender.role === "STUDENT" && target.role === "ALUMNI") ||
    (sender.role === "ALUMNI" && target.role === "STUDENT");

  if (!validPair) {
    throw new Error("Only student to alumni chat allowed");
  }

  const pairKey = buildPairKey(senderId, targetUserId);

  // ⭐ UPSERT SAFE CONVERSATION
  const conversation = await prisma.conversation.upsert({
    where: { userPairKey: pairKey },
    update: {},
    create: {
      userPairKey: pairKey,
      participants: {
        create: [
          { userId: senderId },
          { userId: targetUserId },
        ],
      },
    },
  });

  // ⭐ ATOMIC MESSAGE CREATE
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: conversation.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
      },
    }),
  ]);

  return {
    conversationId: conversation.id,
    message,
  };
};

module.exports = {
  createOrGetConversation,
  sendMessage,
  getMessages,
  getUserConversations,
};