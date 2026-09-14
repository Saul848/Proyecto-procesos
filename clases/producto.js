class Producto {
    // Atributos privados
    #id;
    #nombre;
    #descripcion;
    #precio;
    #stock;
    #descuento; 

    /**
     * Constructor que crea una instancia de Producto
     * @param {number} id ID del producto
     * @param {string} nombre Nombre del producto
     * @param {string} descripcion Descripción del producto
     * @param {number} precio Precio del producto
     * @param {number} stock Cantidad del producto
     */
    constructor({ id = null, nombre = "", descripcion = "", precio = 0, stock = 0, descuento = 0 } = {}) {
        this.#id = id ? String(id) : null;
        this.#nombre = String(nombre);
        this.#descripcion = String(descripcion);
        this.#precio = Number(precio);
        this.#stock = Number(stock);
        this.#descuento = Number (descuento);
    }

    //------------------ Getters ------------------
    /**
     * Obtiene el id del producto
     *
     * @returns {number} Id del producto.
     */
    get id() {
        return this.#id;
    }

    /**
     * Obtiene el nombre completo del producto
     *
     * @returns {string} Nombre del producto.
     */
    get nombre() {
        return this.#nombre;
    }

    /**
     * Obtiene la descripcion del producto
     *
     * @returns {string} Descripcion del producto.
     */
    get descripcion() {
        return this.#descripcion;
    }

    /**
     * Obtiene el precio del producto
     *
     * @returns {number} Precio del producto.
     */
    get precio() {
        return this.#precio;
    }

    /**
     * Obtiene el stock del producto
     *
     * @returns {string} Stock del producto.
     */
    get stock() {
        return this.#stock;
    }

    /**
     * Obtiene el descuento del producto
     *
     * @returns {string} descuento del producto.
     */
    get descuento() {
        return this.#descuento;
    }

    //------------------ Setters ------------------

    /**
     * Modifica el id del producto.
     *
     * @param {number} nId - Nuevo id del producto.
     * @returns {void}
     */
    set id(nId) {
        this.#id = nId;
    }

    set id(id) {
        this.#id = id ? String(id) : null;
    }

    /**
     * Modifica el nombre del producto.
     *
     * @param {string} nnombre - Nuevo nombre del producto.
     * @returns {void}
     */
    set nombre(nombre) {
        this.#nombre = String(nombre);
    }

    /**
     * Modifica la descripcion del producto.
     *
     * @param {string} nId - Nueva descripcion del producto.
     * @returns {void}
     */
    set descripcion(descripcion) {
        this.#descripcion = String(descripcion);
    }

    /**
     * Modifica el precio del producto.
     *
     * @param {number} nId - Nuevo precio del producto.
     * @returns {void}
     */
    set precio(precio) {
        const valor = Number(precio);
        if (isNaN(valor) || valor < 0) {
            throw new Error("El precio debe ser un número válido mayor o igual a 0.");
        }
        this.#precio = valor;
    }

    /**
     * Modifica el stock del producto.
     *
     * @param {number} nId - Nuevo stock del producto.
     * @returns {void}
     */
    set stock(stock) {
        const valor = Number(stock);
        if (!Number.isInteger(valor) || valor < 0) {
            throw new Error("El stock debe ser un número entero mayor o igual a 0.");
        }
        this.#stock = valor;
    }

    /**
     * Modifica el descuento del producto.
     *
     * @param {number} nId - Nuevo descuento del producto.
     * @returns {void}
     */
    set descuento(descuento) {
        const valor = Number(descuento);
        if (isNaN(valor) || valor < 0 || valor > 1) {
            throw new Error("El descuento debe ser un número válido mayor o igual a 0 y menor que 1.");
        }
        this.#descuento = valor;
    }

    // Método toJSON
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            descripcion: this.#descripcion,
            precio: Number(this.#precio.toFixed(2)),
            stock: this.#stock,
            descuento: this.#descuento
        };
    }
}

module.exports = Producto;