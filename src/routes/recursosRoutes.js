import express from "express";
import {
  getRecursos,
  createRecurso,
  updateRecurso,
  deleteRecurso,
  addFavorito,
  calificarRecurso,
  getRecursosFavoritos,
} from "../controllers/recursosController.js";
import {
  verifyToken,
  isDocente,
  isEstudiante,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas accesibles para ambos roles (requiere estar autenticado)
router.get("/", verifyToken, getRecursos);

// Rutas exclusivas para el Docente
router.post("/", verifyToken, isDocente, createRecurso);
router.put("/:id", verifyToken, isDocente, updateRecurso);
router.delete("/:id", verifyToken, isDocente, deleteRecurso);

// Rutas exclusivas para el Estudiante
router.get("/favoritos", verifyToken, isEstudiante, getRecursosFavoritos);
router.post("/:id/favoritos", verifyToken, isEstudiante, addFavorito);
router.post("/:id/calificar", verifyToken, isEstudiante, calificarRecurso);

export default router;
