/**
 * @file Servidor principal Express para la API de gestion de oxxo.
 * @description Configura los middlewares, sirve archivos estáticos e integra las rutas de la API.
 * @module app
 * @requires express
 * 
 */


const express = require("express");

// const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
// const ventaRoutes = require("./routes/ventaRoutes");

// const empleadoRoute
const empleadoRoutes = require("./routes/empleadoRoutes");



const app = express();
/**
 * Middleware para procesar cuerpos de solicitud en formato JSON.
 */
app.use(express.json());
/**
 * Middleware para servir archivos estáticos (frontend UI, assets, etc.).
 */
app.use(express.static("public"));

// app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
// app.use("/api/ventas", ventaRoutes);

/**
 * Montaje del enrutador de alumnos en la ruta base de la API.
 * @name /api/empleados
 * @see module:routes/empleadoRoutes
 */
app.use("/api/empleados", empleadoRoutes);


/**
 * Puerto de escucha predeterminado del servidor.
 * @type {number}
 */
const PORT = 3000;

/**
 * Inicia el servidor HTTP.
 */
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});