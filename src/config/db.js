import mysql from "mysql2/promise";
import dotenv from "dotenv";

//Carga las variables de entorno desde el archivo .env
dotenv.config();

// Creamos un pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Conexión a la base de datos MySQL exitosa.");
    connection.release();
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error.message);
  });

export default pool;
