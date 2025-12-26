// import { Router } from "express";
import express from "express";
import { registerUser } from "../controllers/Authcontrollers/register.controller.js";
import { loginUser } from "../controllers/Authcontrollers/login.controller.js";
import { logoutUser } from "../controllers/Authcontrollers/logout.controller.js";

const router = express.Router();

// const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
