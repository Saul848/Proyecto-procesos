const ofertaDao = require ("../dao/ofertaDao");
const productoDao = require ("../dao/productoDao");
const Oferta = require ("../clases/ofertaClass");

/**
 * Calcula el estado de una oferta según su rango de fechas.
 *
 * @param {string} fechaInicio - Fecha de inicio de vigencia (aaaa-mm-dd).
 * @param {string} fechaFin - Fecha de fin de vigencia (aaaa-mm-dd).
 * @returns {string} Estado de la oferta: disponible, proxima o caducada.
 */
function calcularEstado(fechaInicio, fechaFin){
    const hoy = new Date().toLocaleDateString('en-CA');
    if (hoy > fechaFin) return 'caducada';
    if (hoy < fechaInicio) return 'proxima';
    return 'disponible';
}

/**
 * Lista las ofertas que están "disponibles" o "proximas" (excluye las caducadas),
 * enriqueciéndolas con el nombre del producto y su estado calculado.
 * 
 * @param {Object} req - Petición HTTP (sin parámetros).
 * @param {Object} res - Respuesta HTTP.
 * @returns {void} Envía un arreglo de ofertas visibles, o error 500 si falla.
 */
function listarOfertas(req, res){
    try{
        const ofertas = ofertaDao.obtenerOfertas();
        const productos = productoDao.obtenerProductos();

        const ofertasConProducto = ofertas.map(o => {
            const producto = productos.find(p => String(p.id) === String(o.idProducto));
            return {
                ...o,
                nombreProducto: producto ? producto.nombre : 'Producto no encontrado',
                estado: calcularEstado(o.fechaInicio, o.fechaFin)
            };
        });

        const ofertasVisibles = ofertasConProducto.filter(o =>
            o.estado === 'disponible' || o.estado === 'proxima'
        );

        res.json(ofertasVisibles);
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al listar ofertas.", error: error.message });
    }
}

/**
 * Crea una nueva oferta, genera el ID, crea la instancia Oferta, la guarda en el XML
 * y registra la acción en el historial.
 * 
 * @param {Object} req - Petición HTTP. En req.body espera: idProducto, tipoProm, valorDesc
 * valorDesc, cantidadRecibe, cantidadPaga, fechaInicio y fechaFin.
 * @param {Object} res - Respuesta HTTP.
 * @returns {void} Envía { ok: true, oferta } con código 201, o error 400/500.
 */
function crearOferta(req, res){
    try{
        const { idProducto, tipoProm, valorDesc, cantidadRecibe, cantidadPaga, fechaInicio, fechaFin } = req.body;

        const idProductoStr = String(idProducto);
        const productos = productoDao.obtenerProductos();
        const productoExiste = productos.some(p => String(p.id) === idProductoStr);
        if (!productoExiste){
            return res.status(400).json({ ok: false, mensaje: "El producto seleccionado no existe." });
        }

        const producto = producto.find(p => String(p.id) === idProductoStr);
        if(producto && Number(producto.stock) <= 0){
            return res.status(400).json({ ok: false, mensaje: "No se puede craer una oferta para un producto sin stock."});
        }

        if (tipoProm === 'porcentaje' && (Number(valorDesc) <= 0 || Number(valorDesc) > 100)){
            return res.status(400).json({ ok: false, mensaje: "El porcentaje debe estar entre 1 y 100." });
        }
        if ((tipoProm === 'precioFijo') && (isNaN(Number(valorDesc)) || Number(valorDesc) <= 0)){
            return res.status(400).json({ ok: false, mensaje: "El precio final debe ser un número mayor a 0." });
        }

        const ofertas = ofertaDao.obtenerOfertas();
        const yaTieneOferta = ofertas.some(o => String(o.idProducto) === idProductoStr);
        if (yaTieneOferta){
            return res.status(400).json({ ok: false, mensaje: "Este producto ya tiene una oferta asignada." });
        }

        const maxNumero = ofertas.reduce((max, o) => {
            const num = parseInt(o.id.replace('OF-', ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        const id = `OF-${String(maxNumero + 1).padStart(2, "0")}`;

        //crea instancia de Oferta
        const oferta = new Oferta({
            id,
            idProducto: idProductoStr,
            tipoProm,
            valorDesc: tipoProm === 'porcentaje' || tipoProm === 'precioFijo' ? valorDesc : 1,
            cantidadRecibe: tipoProm === 'cantidad' ? cantidadRecibe : 1,
            cantidadPaga: tipoProm === 'cantidad' ? cantidadPaga : 1,
            fechaInicio,
            fechaFin
        });

        //guardamos en el xml
        ofertaDao.agregarOferta(oferta.toJSON());



        ofertaDao.agregarRegistroHistorial({
            id: `H-${Date.now()}`,
            accion: 'crear',
            idOferta: id,
            idProducto: idProductoStr,
            tipoProm,
            valorDesc: oferta.valorDesc,
            cantidadRecibe: oferta.cantidadRecibe,
            cantidadPaga: oferta.cantidadPaga,
            fechaHora: new Date().toLocaleString('es-MX')
        });

        res.status(201).json({ ok: true, mensaje: "Oferta creada exitosamente.", oferta: oferta.toJSON() });
    } catch(error){
        res.status(400).json({ ok: false, mensaje: "Error al crear la oferta.", error: error.message });
    }
}

/**
 * Elimina una oferta por su ID, registrando la acción en el historial.
 * 
 * @param {Object} req - Petición HTTP. En req.params.id va el ID de la oferta.
 * @param {Object} res - Respuesta HTTP.
 * @returns {void} Envía { ok: true, mensaje } si se elimina, o error 404/500.
 */
function eliminarOferta(req, res){
    try{
        const {id} = req.params;

        const ofertas = ofertaDao.obtenerOfertas();
        const ofertaEncontrada = ofertas.find(o => String(o.id) === String(id));

        const resultado = ofertaDao.eliminarOferta(id);

        if(!resultado.encontrado){
            return res.status(404).json({ ok: false, mensaje: "Oferta no encontrada." });            
        }

        ofertaDao.agregarRegistroHistorial({
            id: `H-${Date.now()}`,
            accion: 'eliminar',
            idOferta: id,
            idProducto: ofertaEncontrada ? ofertaEncontrada.idProducto : '',
            tipoProm: ofertaEncontrada ? ofertaEncontrada.tipoProm : '',
            valorDesc: ofertaEncontrada ? ofertaEncontrada.valorDesc : 0,
            cantidadRecibe: ofertaEncontrada ? ofertaEncontrada.cantidadRecibe : 1,
            cantidadPaga: ofertaEncontrada ? ofertaEncontrada.cantidadPaga : 1,
            fechaHora: new Date().toLocaleString('es-MX')
        });

        res.json({ ok: true, mensaje: `Oferta ${id} eliminada.` });
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la oferta.", error: error.message });
    }
}

/**
 * Obtiene todos los registros del historial de acciones sobre ofertas
 * (crear/eliminar), enriqueciéndolos con el nombre del producto.
 * 
 * @param {Object} req - Petición HTTP (sin parámetros).
 * @param {Object} res - Respuesta HTTP.
 * @returns {void} Envía un arreglo de registros, o error 500 si falla.
 */
function obtenerHistorial(req, res){
    try{
        const registros = ofertaDao.obtenerHistorial();
        const productos = productoDao.obtenerProductos();

        const registrosConProducto = registros.map(r => {
            const producto = productos.find(p => String(p.id) === String(r.idProducto));
            return{
                ...r,
                nombreProducto: producto ? producto.nombre : 'Producto no encontrado'
            };
        });

        res.json(registrosConProducto);
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al leer historial.", error: error.message});
    }
}

module.exports = {
    listarOfertas,
    crearOferta,
    eliminarOferta,
    obtenerHistorial
};