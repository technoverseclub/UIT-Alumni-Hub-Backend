const chatService = require("../services/chat.service");

const createConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    const conversation = await chatService.createOrGetConversation(
      currentUserId,
      targetUserId,
    );

    res.status(200).json(conversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await chatService.getMessages(
      Number(conversationId),
      userId,
    );

    res.status(200).json(messages);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json(conversations);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { targetUserId, content } = req.body;

    const message = await chatService.sendMessage(
      senderId,
      targetUserId,
      content,
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

module.exports = {
  createConversation,
  sendMessage,
  getMessages,
  getUserConversations,
};
