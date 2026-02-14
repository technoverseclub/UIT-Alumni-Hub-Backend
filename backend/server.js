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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================= JWT AUTH MIDDLEWARE =================
io.use((socket, next) => {
  // console.log("Full handshake:", socket.handshake);
  // console.log("Handshake auth:", socket.handshake.auth?.token);
  // console.log("Handshake auth:", socket.handshake.query.token);

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
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log("Invalid JSON");
        return;
      }
    }

    const conversationId = Number(data.conversationId);
    const content = data.content;

    console.log("Type of conversationId:", typeof conversationId);

    console.log("Raw data:", data);
    console.log("Type of data:", typeof data);
    console.log("Content value:", content);
    console.log("Type of content:", typeof content);

    try {
      const message = await chatService.sendMessage(
        conversationId,
        socket.user.id,
        content,
      );

      console.log("Incoming payload:", data);

      // Get participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: Number(conversationId) },
      });

      participants.forEach((p) => {
        io.to(`user_${p.userId}`).emit("receive_message", {
          ...message,
          conversationId: Number(conversationId),
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

// require("dotenv").config();
// const app = require("./app");
// const http = require("http");
// const { Server } = require("socket.io");
// // const jwt = require("jsonwebtoken");
// const { verifyToken } = require("./utils/jwt");
// const prisma = require("./utils/prisma");

// const chatService = require("./src/services/chat.service");

// const jwtUtils = require("./utils/jwt");
// console.log(jwtUtils);

// const PORT = process.env.PORT || 5000;

// // Create HTTP server from Express app
// const server = http.createServer(app);

// // Attach Socket.IO to that server
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ================= JWT AUTH MIDDLEWARE =================
// io.use((socket, next) => {
//   console.log("Handshake auth:", socket.handshake.auth?.token);

//   const token = socket.handshake.auth?.token;

//   if (!token) {
//     console.log("No token received");
//     return next(new Error("Unauthorized"));
//   }

//   try {
//     const decoded = verifyToken(token);
//     console.log("Decoded user:", decoded);
//     socket.user = decoded; // attach user data to socket
//     next();
//   } catch (err) {
//     console.log("JWT ERROR:", err.message);
//     return next(new Error("Unauthorized"));
//   }
// });

// // ================= CHAT LOGIC =================
// io.on("connection", (socket) => {
//   const userId = socket.user.id;

//   console.log("User connected:", userId);

//   // Join personal room
//   socket.join(`user_${userId}`);

//   // Send message event
//   socket.on("send_message", async ({ conversationId, content }) => {
//     try {
//       if (content.length > 1000) return;
//       if (!conversationId || !content?.trim()) return;

//       // Security check: ensure user is participant
//       const isParticipant = await prisma.conversationParticipant.findFirst({
//         where: {
//           conversationId,
//           userId: socket.user.id,
//         },
//       });

//       if (!isParticipant) {
//         console.log("unauthorized message attempt");
//         return;
//       }

//       // Save message
//       const message = await prisma.message.create({
//         data: {
//           conversationId,
//           senderId: userId,
//           content,
//         },
//         include: {
//           sender: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//       });

//       // Get all participants
//       const participants = await prisma.conversationParticipant.findMany({
//         where: { conversationId },
//       });

//       // Emit message to each participant
//       participants.forEach((p) => {
//         io.to(`user_${p.userId}`).emit("receive_message", {
//           ...message,
//           conversationId,
//         });
//       });
//     } catch (err) {
//       console.error("Chat error:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", userId);
//   });
// });

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
