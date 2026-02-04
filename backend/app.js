const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./src/routes/auth.routes"));

app.use("/alumni", require("./src/routes/alumni.routes"));

app.use("/student", require("./src/routes/student.routes"));

module.exports = app;
