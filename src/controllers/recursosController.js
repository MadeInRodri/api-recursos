import pool from "../config/db.js";

// ==========================================
// OPERACIONES COMPARTIDAS (Estudiantes y Docentes)
// ==========================================

// Obtener todos los recursos (con opción de búsqueda avanzada)
export const getRecursos = async (req, res) => {
  try {
    const { busqueda, tipo } = req.query;
    let query = "SELECT * FROM recursos WHERE 1=1";
    let params = [];

    // Búsqueda por título o ID
    if (busqueda) {
      query += " AND (titulo LIKE ? OR id = ?)";
      params.push(`%${busqueda}%`, busqueda);
    }

    // Búsqueda/Filtro por tipo
    if (tipo) {
      query += " AND tipo = ?";
      params.push(tipo);
    }

    const [recursos] = await pool.query(query, params);
    res.json(recursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los recursos." });
  }
};

// ==========================================
// OPERACIONES DEL DOCENTE (CRUD)
// ==========================================

export const createRecurso = async (req, res) => {
  try {
    const { titulo, descripcion, tipo, enlace, imagen } = req.body;

    if (!titulo || !descripcion || !tipo || !enlace) {
      return res.status(400).json({
        error: "Título, descripción, tipo y enlace son obligatorios.",
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO recursos (titulo, descripcion, tipo, enlace, imagen) VALUES (?, ?, ?, ?, ?)",
      [titulo, descripcion, tipo, enlace, imagen || null],
    );

    res
      .status(201)
      .json({ mensaje: "Recurso creado exitosamente", id: resultado.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el recurso." });
  }
};

export const updateRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo, enlace, imagen } = req.body;

    const [resultado] = await pool.query(
      "UPDATE recursos SET titulo = ?, descripcion = ?, tipo = ?, enlace = ?, imagen = ? WHERE id = ?",
      [titulo, descripcion, tipo, enlace, imagen || null, id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }

    res.json({ mensaje: "Recurso actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el recurso." });
  }
};

export const deleteRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query("DELETE FROM recursos WHERE id = ?", [
      id,
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }

    res.json({ mensaje: "Recurso eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el recurso." });
  }
};

// ==========================================
// OPERACIONES DEL ESTUDIANTE
// ==========================================

export const addFavorito = async (req, res) => {
  try {
    const { id: recurso_id } = req.params;
    const usuario_id = req.usuario.id; // Obtenido del token

    await pool.query(
      "INSERT INTO favoritos (usuario_id, recurso_id) VALUES (?, ?)",
      [usuario_id, recurso_id],
    );

    res.status(201).json({ mensaje: "Recurso agregado a favoritos." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "El recurso ya está en tus favoritos." });
    }
    console.error(error);
    res.status(500).json({ error: "Error al agregar a favoritos." });
  }
};

export const calificarRecurso = async (req, res) => {
  try {
    const { id: recurso_id } = req.params;
    const { puntuacion } = req.body;
    const usuario_id = req.usuario.id;

    if (puntuacion < 1 || puntuacion > 5) {
      return res
        .status(400)
        .json({ error: "La calificación debe ser entre 1 y 5 estrellas." });
    }

    // Si ya calificó, actualizamos; si no, insertamos (usando ON DUPLICATE KEY UPDATE de MySQL)
    await pool.query(
      `INSERT INTO calificaciones (usuario_id, recurso_id, puntuacion) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE puntuacion = ?`,
      [usuario_id, recurso_id, puntuacion, puntuacion],
    );

    res.json({ mensaje: "Calificación guardada exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calificar el recurso." });
  }
};
