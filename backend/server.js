require("dotenv").config();
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const { verifyToken } = require("./utils/jwt");
const prisma = require("./utils/prisma");
const chatService = require("./src/services/chat.service");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://uit-alumni-hub-frontend.vercel.app",
  "https://hoppscotch.io",
  "chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================= JWT AUTH MIDDLEWARE =================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    socket.user = verifyToken(token);
    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

// ================= CHAT LOGIC =================
io.on("connection", (socket) => {
  socket.join(`user_${socket.user.id}`);

  socket.on("send_message", async (data) => {
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return;
      }
    }

    const targetUserId = Number(data.targetUserId);
    const content = data.content;

    if (!targetUserId || isNaN(targetUserId)) return;
    if (!content?.trim()) return;

    try {
      const result = await chatService.sendMessage(
        socket.user.id,
        targetUserId,
        content,
      );

      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: result.conversationId },
      });

      participants.forEach((p) => {
        io.to(`user_${p.userId}`).emit("receive_message", {
          ...result.message,
          conversationId: result.conversationId,
        });
      });
    } catch (err) {
      // keep only truly useful error logging
      console.error("Socket send error:", err.message);
    }
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
