require("dotenv").config();
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
const { verifyToken } = require("./utils/jwt");
const prisma = require("./utils/prisma");

const chatService = require("./src/services/chat.service");

const jwtUtils = require("./utils/jwt");
console.log(jwtUtils);

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO to that server

const allowedOrigins = [
  "http://localhost:5000",
  "https://uit-alumni-hub-frontend.vercel.app",
  "https://hoppscotch.io",
  "chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld",
];

const io = new Server(server, {
  cors: {
    // origin: function (origin, callback) {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: function (origin, callback) {
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
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// ================= JWT AUTH MIDDLEWARE =================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    console.log("No token received");
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token);
    console.log("Decoded user:", decoded);
    socket.user = decoded; // attach user data to socket
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return next(new Error("Unauthorized"));
  }
});

// ================= CHAT LOGIC =================
io.on("connection", (socket) => {
  const userId = socket.user.id;

  console.log("User connected:", userId);

  // Join personal room
  socket.join(`user_${userId}`);

  // Send message event
  socket.on("send_message", async (data) => {
    console.log("RAW SOCKET DATA:", data, typeof data);
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log("Invalid JSON");
        return;
      }
    }

    // const conversationId = Number(data.conversationId);
    const targetUserId = Number(data.targetUserId);
    const conversationId = data.conversationId
      ? Number(data.conversationId)
      : null;

    const content = String(data.content || "").trim();

    if (!content) {
      console.log("Parsed content is empty:", data);
      return;
    }

    console.log(
      "Calling sendMessage with:",
      socket.user.id,
      targetUserId,
      content,
    );

    try {
      const result = await chatService.sendMessage(
        // conversationId,

        socket.user.id,
        targetUserId,
        content,
      );

      const { conversationId, message } = result;

      console.log("Incoming payload:", data);

      // Get participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: result.conversationId },
      });

      participants.forEach((p) => {
        io.to(`user_${p.userId}`).emit("receive_message", {
          ...message,
          conversationId,
        });
      });
    } catch (err) {
      console.log("Socket send error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
