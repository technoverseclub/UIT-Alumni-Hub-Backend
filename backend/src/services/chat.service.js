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
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return conversations;
};

const sendMessage = async (conversationId, userId, content) => {
  if (!conversationId || !content?.trim()) {
    throw new Error("Missing required fields");
  }

  // 1️⃣ Check conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // 2️⃣ Check user is participant
  const isParticipant = conversation.participants.some(
    (participant) => participant.userId === userId,
  );

  if (!isParticipant) {
    throw new Error("Not authorized for this conversation");
  }

  // 3️⃣ Create message
  const message = await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId: userId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return message;
};

module.exports = {
  createOrGetConversation,
  sendMessage,
  getMessages,
  getUserConversations,
};
