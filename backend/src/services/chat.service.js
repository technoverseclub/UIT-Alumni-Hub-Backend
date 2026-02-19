const prisma = require("../../utils/prisma");

const createOrGetConversation = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new Error("Cannot chat with yourself");
  }

  // Fetch both users
  const users = await prisma.user.findMany({
    where: {
      id: { in: [currentUserId, targetUserId] },
    },
  });

  if (users.length !== 2) {
    throw new Error("User not found");
  }

  const user1 = users.find((u) => u.id === currentUserId);
  const user2 = users.find((u) => u.id === targetUserId);

  // 🔒 Enforce Student ↔ Alumni only
  const validPair =
    (user1.role === "STUDENT" && user2.role === "ALUMNI") ||
    (user1.role === "ALUMNI" && user2.role === "STUDENT");

  if (!validPair) {
    throw new Error("Only student to alumni chat allowed");
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [currentUserId, targetUserId] },
        },
      },
    },
    include: {
      participants: true,
    },
  });

  if (existingConversation && existingConversation.participants.length === 2) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: currentUserId }, { userId: targetUserId }],
      },
    },
    include: {
      participants: true,
    },
  });

  return conversation;
};

const getMessages = async (conversationId, userId) => {
  // Security: ensure user is participant
  const isParticipant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
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

  return conversations;
};

const sendMessage = async (senderId, targetUserId, content) => {
  if (!content?.trim()) {
    throw new Error("Message content is required");
  }

  if (senderId === targetUserId) {
    throw new Error("Cannot message yourself");
  }

  // 1️⃣ Validate both users
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

  // 2️⃣ Enforce Student ↔ Alumni rule
  const validPair =
    (sender.role === "STUDENT" && target.role === "ALUMNI") ||
    (sender.role === "ALUMNI" && target.role === "STUDENT");

  if (!validPair) {
    throw new Error("Only student to alumni chat allowed");
  }

  // 3️⃣ Check if conversation already exists
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: senderId } } },
        { participants: { some: { userId: targetUserId } } },
      ],
    },
  });

  // 4️⃣ Create conversation ONLY if needed
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: senderId }, { userId: targetUserId }],
        },
      },
    });
  }

  // 5️⃣ Create message + update conversation atomically
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
