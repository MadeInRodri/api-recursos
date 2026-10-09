# API de Recursos de Aprendizaje

API REST para una aplicación de recursos de aprendizaje dirigida a estudiantes y docentes. Permite registrar e iniciar sesión con distintos roles, consultar recursos educativos y, según los permisos de cada rol, administrarlos o guardarlos y calificarlos.

## 1. Información del estudiante y contexto

### Información académica

- **Estudiante:** Rodrigo Alexis Mejía Rivas
- **Institución:** Universidad Don Bosco
- **Carrera o programa:** Ing. en Ciencias de la computación
- **Asignatura:** Desarrollo de Software Multiplataforma
- **Docente:** [Completar]
- **Periodo académico:** [Completar]

### Contexto de la API

La API proporciona el servicio backend para una aplicación móvil de recursos estudiantiles. Los usuarios se registran como **Estudiante** o **Docente**. Ambos roles pueden consultar los recursos; los docentes pueden crearlos, actualizarlos y eliminarlos, mientras que los estudiantes pueden añadirlos a favoritos y asignarles una calificación de una a cinco estrellas.

La autenticación se realiza mediante tokens JWT. Las contraseñas se almacenan como hashes y las operaciones restringidas requieren enviar el token en la cabecera `Authorization`.

## 2. Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| **Node.js** y **JavaScript con módulos ES** | Ejecutar la aplicación. |
| **Express 5** | Definir el servidor HTTP y las rutas REST. |
| **MySQL** | Almacenar usuarios, recursos, favoritos y calificaciones. |
| **mysql2** | Conectarse a MySQL mediante un pool de conexiones. |
| **JSON Web Token (JWT)** (`jsonwebtoken`) | Autenticar y autorizar solicitudes. |
| **bcrypt** | Generar y verificar hashes de contraseñas. |
| **dotenv** | Cargar configuración desde variables de entorno. |
| **CORS** (`cors`) | Habilitar solicitudes desde otros orígenes. |
| **Nodemon** | Reiniciar automáticamente el servidor durante el desarrollo. |
| **Postman** | Probar los endpoints; la colección se encuentra en [`endpoints-postman.json`](./endpoints-postman.json). |

## 3. Instalación local y base de datos

### Requisitos previos

- Node.js 18 o posterior y npm.
- MySQL instalado y en ejecución.
- Acceso a una cuenta de MySQL con permisos para crear la base de datos y sus tablas.

### Obtener e instalar el proyecto

Clona el repositorio y accede a su carpeta:

```bash
git clone https://github.com/MadeInRodri/api-recursos.git
cd api-recursos
npm install
```

### Crear la base de datos

El script [`db/db.sql`](./db/db.sql) crea la base de datos `recursos_aprendizaje` y las tablas necesarias: `usuarios`, `recursos`, `favoritos` y `calificaciones`.

Puedes ejecutar el script desde MySQL Workbench abriendo `db/db.sql` y ejecutando todas sus instrucciones. En Windows, también puedes importarlo desde el **Símbolo del sistema (CMD)**, situado en la carpeta raíz del proyecto y con el cliente `mysql` disponible en `PATH`:

```cmd
mysql -u root -p < db\db.sql
```

Introduce la contraseña de MySQL cuando se solicite. Si utilizas otro usuario administrador, sustituye `root` por su nombre.

### Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto y configura los datos de conexión de tu instalación de MySQL:

```dotenv
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_de_mysql
DB_NAME=recursos_aprendizaje
DB_PORT=3306
JWT_SECRET=reemplaza_esto_por_una_clave_secreta_larga_y_unica
```

Reemplaza los valores de ejemplo por los de tu entorno. `PORT` es opcional (la aplicación utiliza `3000` si no se define); el resto de las variables debe corresponder a la configuración local. Mantén el archivo `.env` privado y no publiques la clave JWT ni las credenciales de la base de datos.

### Iniciar el servidor

Para desarrollo, con reinicio automático:

```bash
npm run dev
```

Para iniciar el servidor sin Nodemon:

```bash
npm start
```

Por defecto, la API escucha en `http://localhost:3000`. Puedes comprobar que está disponible con:

```http
GET http://localhost:3000/
```

Respuesta esperada:

```json
{
  "mensaje": "Bienvenido a la API de Recursos de Aprendizaje"
}
```

## 4. Endpoints de la API

Las respuestas y solicitudes usan JSON cuando corresponde. Los endpoints que indican **autenticación requerida** esperan la cabecera:

```http
Authorization: Bearer <token>
```

El token se obtiene iniciando sesión. Los tokens expiran después de 24 horas.

### Resumen

| Método   | Endpoint                      | Acceso                           | Descripción                                   |
| -------- | ----------------------------- | -------------------------------- | --------------------------------------------- |
| `GET`    | `/`                           | Público                          | Comprueba que la API esté disponible.         |
| `POST`   | `/api/auth/register`          | Público                          | Registra un estudiante o docente.             |
| `POST`   | `/api/auth/login`             | Público                          | Inicia sesión y devuelve un token JWT.        |
| `GET`    | `/api/recursos`               | Estudiante o docente autenticado | Lista recursos; permite búsqueda y filtro.    |
| `POST`   | `/api/recursos`               | Solo docente                     | Crea un recurso.                              |
| `PUT`    | `/api/recursos/:id`           | Solo docente                     | Actualiza todos los campos de un recurso.     |
| `DELETE` | `/api/recursos/:id`           | Solo docente                     | Elimina un recurso.                           |
| `POST`   | `/api/recursos/:id/favoritos` | Solo estudiante                  | Añade el recurso a favoritos.                 |
| `POST`   | `/api/recursos/:id/calificar` | Solo estudiante                  | Crea o actualiza la calificación del recurso. |

### Detalle de los endpoints

#### `POST /api/auth/register`

Registra una cuenta. Todos los campos son obligatorios. `rol` debe ser `Estudiante` o `Docente`. La contraseña debe tener al menos 12 caracteres e incluir una letra minúscula, una mayúscula, un número y uno de estos caracteres especiales: `! @ # $ % ^ & *`.

Solicitud:

```json
{
  "correo": "estudiante@example.com",
  "password": "Estudiante123!",
  "rol": "Estudiante"
}
```

Respuesta `201 Created`:

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuarioId": 1
}
```

Puede responder `400 Bad Request` si faltan campos, el rol o la contraseña no cumplen los requisitos, o el correo ya está registrado.

#### `POST /api/auth/login`

Autentica al usuario con su correo y contraseña.

Solicitud:

```json
{
  "correo": "estudiante@example.com",
  "password": "Estudiante123!"
}
```

Respuesta `200 OK` (el valor de `token` variará):

```json
{
  "mensaje": "Login exitoso",
  "token": "<token-jwt>",
  "usuario": {
    "id": 1,
    "correo": "estudiante@example.com",
    "rol": "Estudiante"
  }
}
```

Responde `401 Unauthorized` si las credenciales no son válidas.

#### `GET /api/recursos`

Requiere autenticación de estudiante o docente. Devuelve una lista de recursos, que puede estar vacía. Cada recurso incluye `id`, `titulo`, `descripcion`, `tipo`, `enlace` e `imagen`.

Parámetros de consulta opcionales:

- `busqueda`: busca coincidencias en el título o un recurso cuyo ID coincida con el valor.
- `tipo`: filtra por coincidencia exacta del tipo.

Ejemplo:

```http
GET /api/recursos?busqueda=javascript&tipo=video
Authorization: Bearer <token>
```

Respuesta `200 OK`:

```json
[
  {
    "id": 1,
    "titulo": "Introducción a JavaScript",
    "descripcion": "Curso introductorio para aprender los fundamentos.",
    "tipo": "video",
    "enlace": "https://example.com/curso-javascript",
    "imagen": "https://example.com/imagenes/javascript.png"
  }
]
```

#### `POST /api/recursos`

Requiere autenticación como docente. `titulo`, `descripcion`, `tipo` y `enlace` son obligatorios; `imagen` es opcional.

Solicitud:

```json
{
  "titulo": "Introducción a JavaScript",
  "descripcion": "Curso introductorio para aprender los fundamentos.",
  "tipo": "video",
  "enlace": "https://example.com/curso-javascript",
  "imagen": "https://example.com/imagenes/javascript.png"
}
```

Respuesta `201 Created`:

```json
{
  "mensaje": "Recurso creado exitosamente",
  "id": 1
}
```

Responde `400 Bad Request` si faltan campos obligatorios.

#### `PUT /api/recursos/:id`

Requiere autenticación como docente. Envía todos los campos del recurso en el cuerpo; este endpoint reemplaza los valores de los campos, por lo que omitir `imagen` la establece como `null`.

Solicitud a `PUT /api/recursos/1`:

```json
{
  "titulo": "Introducción a JavaScript actualizada",
  "descripcion": "Descripción actualizada del recurso.",
  "tipo": "video",
  "enlace": "https://example.com/curso-javascript",
  "imagen": "https://example.com/imagenes/javascript.png"
}
```

Respuesta `200 OK`:

```json
{
  "mensaje": "Recurso actualizado exitosamente"
}
```

Responde `404 Not Found` si no existe un recurso con ese ID.

#### `DELETE /api/recursos/:id`

Requiere autenticación como docente.

Ejemplo: `DELETE /api/recursos/1`.

Respuesta `200 OK`:

```json
{
  "mensaje": "Recurso eliminado exitosamente"
}
```

Responde `404 Not Found` si no existe el recurso. La base de datos elimina también los favoritos y las calificaciones asociados a ese recurso.

#### `POST /api/recursos/:id/favoritos`

Requiere autenticación como estudiante. No necesita cuerpo; el ID del usuario se obtiene del token.

Ejemplo: `POST /api/recursos/1/favoritos`.

Respuesta `201 Created`:

```json
{
  "mensaje": "Recurso agregado a favoritos."
}
```

Responde `400 Bad Request` si el estudiante ya había añadido ese recurso a favoritos.

#### `POST /api/recursos/:id/calificar`

Requiere autenticación como estudiante. `puntuacion` debe ser un número entero entre `1` y `5`. Si el estudiante ya calificó el recurso, se actualiza su calificación.

Solicitud a `POST /api/recursos/1/calificar`:

```json
{
  "puntuacion": 5
}
```

Respuesta `200 OK`:

```json
{
  "mensaje": "Calificación guardada exitosamente."
}
```

Responde `400 Bad Request` si la puntuación está fuera del intervalo permitido.

### Autenticación y errores comunes

- Sin token: `401 Unauthorized`.
- Token inválido o vencido: `400 Bad Request`.
- Rol sin permiso para el endpoint: `403 Forbidden`.
- Recurso inexistente en actualización o eliminación: `404 Not Found`.
- Errores inesperados del servidor: `500 Internal Server Error`.

### Ejemplo completo de uso

El siguiente flujo registra un estudiante, inicia sesión, consulta los recursos y agrega uno a favoritos. Sustituye el ID `1` por el identificador de un recurso existente:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"estudiante@example.com\",\"password\":\"Estudiante123!\",\"rol\":\"Estudiante\"}"
```

Inicia sesión y copia el valor de `token` de la respuesta:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"estudiante@example.com\",\"password\":\"Estudiante123!\"}"
```

Consulta los recursos:

```bash
curl http://localhost:3000/api/recursos?busqueda=javascript \
  -H "Authorization: Bearer <token>"
```

Agrega a favoritos el recurso con ID `1`:

```bash
curl -X POST http://localhost:3000/api/recursos/1/favoritos \
  -H "Authorization: Bearer <token>"
```

También puedes importar [`endpoints-postman.json`](./endpoints-postman.json) en Postman. La colección incluye ejemplos para los dos roles y guarda automáticamente los tokens obtenidos al iniciar sesión.

## 5. Enlaces del proyecto

- **Repositorio de esta API:** [MadeInRodri/api-recursos](https://github.com/MadeInRodri/api-recursos)
- **Deploy de la API:** pendiente de publicación.
- **Repositorio de la aplicación móvil:** pendiente de creación o publicación.
