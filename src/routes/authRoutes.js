import express from "express";
import { register, login } from "../controllers/authController.js"; // Recuerda el .js

const router = express.Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

export default router;
