/**
 * Representa una Oferta
 */
class Oferta{
    #id;
    #idProducto;
    #tipoProm;
    #valorDesc;
    #cantidadRecibe;
    #cantidadPaga;
    #fechaInicio;
    #fechaFin;

    /**
     * Constructor que crea una instancia de Oferta.
     *
     * @param {Object} datos - Objeto con los datos de la oferta.
     * @param {number} datos.id - ID de la oferta.
     * @param {string} datos.idProducto - ID del producto al que aplica.
     * @param {string} datos.tipoProm - Tipo de promoción (porcentaje, cantidad, precioFijo).
     * @param {number} datos.valorDesc - Valor del descuento.
     * @param {number} datos.cantidadRecibe - Cantidad que recibe el cliente.
     * @param {number} datos.cantidadPaga - Cantidad que paga el cliente.
     * @param {string} datos.fechaInicio - Fecha de inicio de vigencia.
     * @param {string} datos.fechaFin - Fecha de fin de vigencia.
     */
    constructor({ id = null, idProducto = "", tipoProm = "", valorDesc = 0, cantidadRecibe = 0, cantidadPaga = 0, fechaInicio = "", fechaFin = "" } = {}){
        this.id = id ? String(id) : null;
        this.idProducto = String(idProducto);
        this.tipoProm = tipoProm;
        this.valorDesc = valorDesc;
        this.cantidadRecibe = Number(cantidadRecibe);
        this.cantidadPaga = Number(cantidadPaga);
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    /**
     * Obtiene el ID de la oferta.
     * @returns {string|null} ID de la oferta.
     */
    get id(){
        return this.#id;
    }

    /**
     * Obtiene el ID del producto al que aplica la oferta.
     * @returns {string} ID del producto.
     */
    get idProducto(){
        return this.#idProducto;
    }

    /**
     * Obtiene el tipo de promoción.
     * @returns {string} Tipo de promoción (porcentaje, cantidad, precioFijo).
     */
    get tipoProm(){
        return this.#tipoProm;
    }

    /**
     * Obtiene el valor del descuento.
     * @returns {number} Valor del descuento.
     */
    get valorDesc(){
        return this.#valorDesc;
    }

    /**
     * Obtiene la fecha de inicio de vigencia.
     * @returns {string} Fecha de inicio (aaaa-mm-dd).
     */
    get fechaInicio(){
        return this.#fechaInicio;
    }

    /**
     * Obtiene la fecha de fin de vigencia.
     * @returns {string} Fecha de fin (aaaa-mm-dd).
     */
    get fechaFin(){
        return this.#fechaFin;
    }
    
    /**
     * Modifica el ID de la oferta.
     * @param {number} id - Nuevo ID de la oferta.
     * @returns {void}
     */
    set id(id){
        this.#id = id ? String(id):null;
    }

    /**
     * Modifica el ID del producto al que aplica la oferta.
     * @param {string} idProducto - Nuevo ID del producto.
     * @returns {void}
     */
    set idProducto(idProducto){ 
        this.#idProducto = String(idProducto); 
    }

    /**
     * Modifica el tipo de promoción.
     * Valida que sea uno de los permitidos: "porcentaje", "cantidad" o "precioFijo".
     * @param {string} tipo - Nuevo tipo de promoción.
     * @throws {Error} Si el tipo no es válido.
     * @returns {void}
     */
    set tipoProm(tipo){
        const permitidos = ["porcentaje", "cantidad", "precioFijo"];
        if (!permitidos.includes(tipo)){
            throw new Error("Tipo de promoción no válido. Usa: porcentaje, cantidad o precio fijo.");
        }
        this.#tipoProm = tipo;
    }

    /**
     * Modifica el valor del descuento.
     * Valida que sea un número mayor a 0.
     * @param {number} valorDesc - Nuevo valor del descuento.
     * @throws {Error} Si el valor no es un número válido o es menor o igual a 0.
     * @returns {void}
     */
    set valorDesc(valorDesc){
        const cant = Number(valorDesc);
        if (isNaN(cant) || cant <= 0){
            throw new Error("El valor de descuento debe ser un número entre 0")
        }
        this.#valorDesc = cant;
    }

    /**
     * Modifica la cantidad que recibe el cliente.
     * Valida que sea un número mayor a 0.
     * @param {number} cant - Nueva cantidad que recibe.
     * @throws {Error} Si la cantidad no es un número válido o es menor o igual a 0.
     * @returns {void}
     */
    set cantidadRecibe(cant){
        const n = Number(cant);
        if (isNaN(n) || n <= 0){
            throw new Error("La cantidad que recibe debe ser un número mayor a 0.");
        }
        this.#cantidadRecibe = n;
    }

    /**
     * Modifica la cantidad que paga el cliente.
     * Valida que sea un número mayor a 0.
     * @param {number} cant - Nueva cantidad que paga.
     * @throws {Error} Si la cantidad no es un número válido o es menor o igual a 0.
     * @returns {void}
     */
    set cantidadPaga(cant){
        const n = Number(cant);
        if (isNaN(n) || n <= 0){
            throw new Error("La cantidad que paga debe ser un número mayor a 0.");
        }

        this.#cantidadPaga = n;
    }

    /**
     * Modifica la fecha de inicio de vigencia.
     * Valida que sea obligatoria y no anterior a la fecha actual.
     * @param {string} fecha - Nueva fecha de inicio (aaaa-mm-dd).
     * @throws {Error} Si la fecha es vacía o anterior a hoy.
     * @returns {void}
     */
    set fechaInicio(fecha){
        const fechaI = String(fecha);
        if (!fechaI){
            throw new Error("La fecha de inicio es obligatoria.");
        }

        const hoy = new Date().toLocaleDateString('en-CA');
        if (fechaI < hoy){
            throw new Error("La fecha de inicio no puede ser anterior a la fecha actual.")
        }

        this.#fechaInicio = fechaI;
    }
    
    /**
     * Modifica la fecha de fin de vigencia.
     * Valida que sea obligatoria y no anterior a la fecha de inicio.
     * @param {string} fecha - Nueva fecha de fin (aaaa-mm-dd).
     * @throws {Error} Si la fecha es vacía o anterior a la de inicio.
     * @returns {void}
     */
    set fechaFin(fecha){
        const fechaF = String(fecha);
        if (!fechaF){
            throw new Error("La fecha de fin es obligatoria.");
        }
        if (this.#fechaInicio && fechaF < this.#fechaInicio){
            throw new Error("La fecha de fin no puede ser anterior a la de inicio.");
        }
        this.#fechaFin = fechaF;
    }

    /**
     * Calcula el estado de una oferta según su rango de fechas.
     * @returns {string} Estado de la oferta:
     *   - "disponible": hoy está dentro del rango [fechaInicio, fechaFin].
     *   - "proxima": hoy es anterior a la fecha de inicio.
     *   - "caducada": hoy es posterior a la fecha de fin.
     */
    estado(){
        const hoy = new Date().toLocaleDateString('en-CA');
        if (hoy > this.#fechaFin) return "caducada";
        if (hoy < this.#fechaInicio) return "proxima";
        return "disponible";
    }

    /**
     * Convierte la oferta a un objeto JSON serializable.
     * @returns {Object} Objeto con todos los atributos y el estado calculado.
     */
    toJSON(){
        return{
            id: this.#id,
            idProducto: this.#idProducto,
            tipoProm: this.#tipoProm,
            valorDesc: this.#valorDesc,
            cantidadRecibe: this.#cantidadRecibe,
            cantidadPaga: this.#cantidadPaga,
            fechaInicio: this.#fechaInicio,
            fechaFin: this.#fechaFin,
            estado: this.estado()
        };
    }
}

module.exports = Oferta;