import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Función auxiliar para validar la contraseña
const validarPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}$/;
  return regex.test(password);
};

export const register = async (req, res) => {
  try {
    const { correo, password, rol } = req.body;

    // Validar que vengan los datos
    if (!correo || !password || !rol) {
      return res
        .status(400)
        .json({ error: "Correo, password y rol son obligatorios." });
    }

    // Validar que el rol sea válido
    if (rol !== "Estudiante" && rol !== "Docente") {
      return res
        .status(400)
        .json({ error: "El rol debe ser Estudiante o Docente." });
    }

    // Validar la seguridad de la contraseña
    if (!validarPassword(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial (! @#$%^&*).",
      });
    }

    // Verificar si el usuario ya existe
    const [usuariosExistentes] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar en la base de datos
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (correo, password, rol) VALUES (?, ?, ?)",
      [correo, hashedPassword, rol],
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuarioId: resultado.insertId,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error en el servidor al registrar usuario." });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    //Buscar al usuario por correo
    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
    );
    if (usuarios.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const usuario = usuarios[0];

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    // Generar el JWT con el id y el rol del usuario
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión." });
  }
};
