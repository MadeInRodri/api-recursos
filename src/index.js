import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

// Cargamos las variables de entorno
dotenv.config();

// Inicializamos la aplicación de Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Bienvenido a la API de Recursos de Aprendizaje" });
});

// Definimos el puerto (usará el del .env o el 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Levantamos el servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en el puerto ${PORT}`);
});
