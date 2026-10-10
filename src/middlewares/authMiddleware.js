import jwt from "jsonwebtoken";

//  Middleware para verificar que el token sea válido
export const verifyToken = (req, res, next) => {
  // Obtenemos el token del header 'Authorization'
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    // El formato esperado es "Bearer <token>", así que lo separamos
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verificamos el token con nuestra clave secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos los datos del usuario (id y rol) en la petición (req)
    // para que los controladores puedan saber quién está haciendo la petición
    req.usuario = verified;

    // Pasamos al siguiente middleware o controlador
    next();
  } catch (error) {
    return res.status(400).json({ error: "Token inválido o expirado." });
  }
};

//Middleware para verificar si es Docente
export const isDocente = (req, res, next) => {
  // req.usuario viene del middleware verifyToken
  if (req.usuario.rol !== "Docente") {
    return res
      .status(403)
      .json({ error: "Acceso denegado. Permisos exclusivos para Docentes." });
  }
  next();
};

//Middleware para verificar si es Estudiante
export const isEstudiante = (req, res, next) => {
  if (req.usuario.rol !== "Estudiante") {
    return res.status(403).json({
      error: "Acceso denegado. Permisos exclusivos para Estudiantes.",
    });
  }
  next();
};
