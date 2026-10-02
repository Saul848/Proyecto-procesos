const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");
const empleadoDao = require("../dao/empleadoDao");
const corteDao = require("../dao/corteDao");

const archivoVentas = path.join(__dirname, "../data/xml/ventas.xml"); // Ajusta tu ruta de ventas

exports.realizarCorteCaja = async (req, res) => {
    try {
        const { gerenteIngresado, efectivoFisico } = req.body;

        if (!gerenteIngresado || efectivoFisico === undefined) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre del gerente y el efectivo físico son obligatorios."
            });
        }

        // 1. Validar que el gerente exista en el XML de empleados y tenga el rol de gerente
        const empleados = empleadoDao.obtenerEmpleados();
        const listaEmpleados = Array.isArray(empleados) ? empleados : [empleados];

        const gerenteEncontrado = listaEmpleados.find(emp => 
            (String(emp.nombre).trim().toLowerCase() === String(gerenteIngresado).trim().toLowerCase() ||
             String(emp.usuario).trim().toLowerCase() === String(gerenteIngresado).trim().toLowerCase()) &&
            String(emp.puesto).trim().toLowerCase() === "gerente"
        );

        if (!gerenteEncontrado) {
            return res.status(403).json({
                ok: false,
                mensaje: `Acceso denegado: "${gerenteIngresado}" no está registrado como gerente.`
            });
        }

        // 2. Leer y sumar las ventas del XML de ventas
        if (!fs.existsSync(archivoVentas)) {
            return res.status(404).json({ ok: false, mensaje: "No se encontró el archivo de ventas." });
        }

        const xmlVentas = fs.readFileSync(archivoVentas, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['venta'].includes(tagName)
        });

        const resultadoVentas = parser.parse(xmlVentas);
        const ventas = resultadoVentas.ventas?.venta || [];

        // Sumar el total de todas las ventas registradas 
        // (Opcional: puedes filtrar aquí por fecha si solo quieres las de hoy, ej: ventas.filter(...))
        let totalVentasEsperadas = 0;
        ventas.forEach(v => {
            totalVentasEsperadas += Number(v.total) || 0;
        });

        const efectivoNum = Number(efectivoFisico);
        const diferencia = Number((efectivoNum - totalVentasEsperadas).toFixed(2));

        let tipoDiferencia = "Exacto";
        if (diferencia > 0) tipoDiferencia = "Sobrante";
        if (diferencia < 0) tipoDiferencia = "Faltante";

        const date = new Date();
        const datosCorte = {
            fecha: date.toLocaleDateString(),
            hora: date.toLocaleTimeString(),
            gerente: gerenteEncontrado.nombre,
            ventasEsperadas: totalVentasEsperadas.toFixed(2),
            efectivoFisico: efectivoNum.toFixed(2),
            diferencia: Math.abs(diferencia).toFixed(2),
            tipoDiferencia: tipoDiferencia
        };

        // 3. Guardar en el XML de cortes
        const guardado = corteDao.registrarCorte(datosCorte);

        if (!guardado.ok) {
            return res.status(500).json({ ok: false, mensaje: guardado.mensaje });
        }

        return res.status(200).json({
            ok: true,
            mensaje: "Corte de caja realizado con éxito.",
            resultado: datosCorte
        });

    } catch (error) {
        console.error("Error al realizar el corte de caja:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al procesar el corte de caja."
        });
    }
};