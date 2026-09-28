/**
 * Representa una Venta en el sistema de punto de venta.
 */
class Venta {
    // Atributos privados
    #id;
    #idEmpleado;
    #items;
    #total;
    #fecha;

    /**
     * Crea una instancia de Venta.
     * 
     * @param {string|number|null} [params.id=null] - Folio o identificador de la venta.
     * @param {string|number} [params.idEmpleado=""] - ID del empleado que realizó la venta.
     * @param {Array<Object>} [params.items=[]] - Lista de productos comprados.
     * @param {number} [params.total=0] - Total de la venta.
     * @param {Date|string} [params.fecha=new Date()] - Fecha de registro.
     */

    constructor({ id = null, idEmpleado = "", items = [], total = 0, fecha = new Date() } = {}) {
        this.id = id;
        this.idEmpleado = idEmpleado;
        this.items = items;
        this.total = total;
        this.fecha = fecha;
    }

    // ------------------ Getters ------------------

    
    // Obtiene el identificador o folio de la venta.
    get id() {
        return this.#id;
    }

    
    // Obtiene el ID del empleado que realizó la venta.
    get idEmpleado() {
        return this.#idEmpleado;
    }

    
    // Obtiene los productos registrados en la venta.
    get items() {
        return this.#items;
    }

    
    // Obtiene el monto total de la venta.
    get total() {
        return this.#total;
    }

    
    // Obtiene la fecha de registro de la venta en formato ISO o string.
    
    get fecha() {
        return this.#fecha;
    }

    // ------------------ Setters ------------------

    
    // Asigna el identificador de la venta.
     set id(nId) {
        this.#id = nId ? String(nId) : null;
    }

    //Asigna el ID del empleado responsable.
     set idEmpleado(nIdEmpleado) {
        this.#idEmpleado = String(nIdEmpleado || "");
    }

    //Asigna los ítems de la venta validando que sea un arreglo.
    set items(nItems) {
        if (!Array.isArray(nItems)) {
            throw new Error("Los ítems de la venta deben ser un arreglo.");
        }
        this.#items = nItems;
    }

    // Asigna el total liquidado de la venta validando que sea numérico y no negativo.
    set total(nTotal) {
        const valor = Number(nTotal);
        if (isNaN(valor) || valor < 0) {
            throw new Error("El total de la venta debe ser un número mayor o igual a 0.");
        }
        this.#total = Number(valor.toFixed(2));
    }

    // Asigna la fecha de emisión de la venta.
    set fecha(nFecha) {
        if (nFecha instanceof Date) {
            this.#fecha = nFecha.toISOString();
        } else {
            this.#fecha = String(nFecha || new Date().toISOString());
        }
    }

    // ------------------ Serialización ------------------

    /**
     * Convierte la instancia a un objeto plano listo para convertir a XML o responder en JSON.
     * @returns {Object} Representación JSON de la venta.
     */
    toJSON() {
        return {
            id: this.#id,
            idEmpleado: this.#idEmpleado,
            items: this.#items,
            total: this.#total,
            fecha: this.#fecha
        };
    }
}

module.exports = Venta;