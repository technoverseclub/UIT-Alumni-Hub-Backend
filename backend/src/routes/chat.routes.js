const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/conversation", authMiddleware, chatController.createConversation);

router.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  chatController.getMessages,
);

router.get(
  "/conversations",
  authMiddleware,
  chatController.getUserConversations,
);

router.post("/message", authMiddleware, chatController.sendMessage);

module.exports = router;
