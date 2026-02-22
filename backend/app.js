const express = require("express");
const cors = require("cors");

const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   }),
// );

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://uit-alumni-hub-frontend.vercel.app",
  "https://hoppscotch.io",
  "chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", require("./src/routes/auth.routes"));

app.use("/alumni", require("./src/routes/alumni.routes"));

app.use("/student", require("./src/routes/student.routes"));

app.use("/chat", require("./src/routes/chat.routes"));
module.exports = app;
