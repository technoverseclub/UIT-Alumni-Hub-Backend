const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./src/routes/auth.routes"));

app.use("/api/email", require("./src/routes/emailRoutes"));

module.exports = app;


