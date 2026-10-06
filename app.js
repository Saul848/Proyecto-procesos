/**
 * @file Servidor principal Express para la API de gestion de oxxo.
 * @description Configura los middlewares, sirve archivos estáticos e integra las rutas de la API.
 * @module app
 * @requires express
 * 
 */

require("dotenv").config(); // Libreria para acceder a la clave del .env y obtener la clave_secreta para cifrar los tokens

const express = require("express");

// const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const ventaRoutes = require("./routes/ventaRoutes");
const mensajeRoutes = require ("./routes/mensajeRoutes");

const movimientoProdRoutes = require("./routes/movimientosProdRoutes");//////////////

// const empleadoRoute
const empleadoRoutes = require("./routes/empleadoRoutes");

// const ofertaRoutes
const ofertaRoutes = require("./routes/ofertaRoutes");
//categorias de productos
const categoriaRoutes = require("./routes/categoriaRoutes");
//cajas
const cajasRoutes = require("./routes/cajasRoutes");
//accesoControlador
const accesoControlador = require("./controladores/accesoControlador");

//const transaccionRoutes
const transaccionRoutes = require('./routes/transaccionRoutes');

const path = require('path');

const app = express();
/**
 * Middleware para procesar cuerpos de solicitud en formato JSON.
 */
app.use(express.json());
/**
 * Middleware para servir archivos estáticos (frontend UI, assets, etc.).
 */
app.use(express.static("public"));

app.use('/data', express.static(path.join(__dirname, 'data')));

// app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use('/api/transacciones', transaccionRoutes);

// Consulta de movimientos sobre inventario
app.use("/api/movimientosProd", movimientoProdRoutes); 

/**
 * Montaje del enrutador de alumnos en la ruta base de la API.
 * @name /api/empleados
 * @see module:routes/empleadoRoutes
 */
app.use("/api/empleados", empleadoRoutes);

// Rutas de ofertas
app.use("/api/ofertas", ofertaRoutes);

/**
 * Montaje del enrutador de categorias en la ruta base de la API.
 * @name /api/categorias
 * @see module:routes/categoriaRoutes
 */
app.use("/api/categorias", categoriaRoutes);

/**
 * apuntador de ruta para mensajes
 */
app.use("/api/mensajes", mensajeRoutes);


app.use("/api/cajas", cajasRoutes);

// Rutas de accesos (bitácora de entrada/salida)
app.post('/api/accesos/registrar', accesoControlador.registrarAcceso);
app.get('/api/accesos', accesoControlador.obtenerAccesos);

const corteRoutes = require("./routes/corteRoutes");
app.use("/api/cortes", corteRoutes);

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