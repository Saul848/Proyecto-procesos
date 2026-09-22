class Producto {
    // Atributos privados
    #id;
    #nombre;
    #descripcion;
    #precio;
    #stock;
    #descuento;
    #categoria;

    /**
     * Constructor que crea una instancia de Producto
     * @param {number} id ID del producto
     * @param {string} nombre Nombre del producto
     * @param {string} descripcion Descripción del producto
     * @param {number} precio Precio del producto
     * @param {number} stock Cantidad del producto
     * @param {number} descuento Descuento del producto, por defecto 0
     * @param {string} categoria Categoría del producto
     */
    constructor({id = null, nombre = "", descripcion = "", precio = 0, stock = 0, descuento = 0, categoria = "" } = {}) {
        this.#id = id ? String(id) : null;
        this.#nombre = String(nombre);
        this.#descripcion = String(descripcion);
        this.#precio = Number(precio);
        this.#stock = Number(stock);
        this.#descuento = Number(descuento);
        this.#categoria = String(categoria);
    }

    //------------------ Getters ------------------

    get id() {
        return this.#id;
    }

    get nombre() {
        return this.#nombre;
    }

    get descripcion() {
        return this.#descripcion;
    }

    get precio() {
        return this.#precio;
    }

    get stock() {
        return this.#stock;
    }

    get descuento() {
        return this.#descuento;
    }

    get categoria() {
        return this.#categoria;
    }

    //------------------ Setters ------------------

    set id(id) {
        this.#id = id ? String(id) : null;
    }

    set nombre(nombre) {
        this.#nombre = String(nombre);
    }

    set descripcion(descripcion) {
        this.#descripcion = String(descripcion);
    }

    set precio(precio) {
        const valor = Number(precio);

        if (isNaN(valor) || valor < 0) {
            throw new Error(
                "El precio debe ser un número válido mayor o igual a 0."
            );
        }

        this.#precio = valor;
    }

    set stock(stock) {
        const valor = Number(stock);

        if (!Number.isInteger(valor) || valor < 0) {
            throw new Error(
                "El stock debe ser un número entero mayor o igual a 0."
            );
        }

        this.#stock = valor;
    }

    set descuento(descuento) {
        const valor = Number(descuento);

        if (isNaN(valor) || valor < 0 || valor > 1) {
            throw new Error(
                "El descuento debe ser un número válido entre 0 y 1."
            );
        }

        this.#descuento = valor;
    }

    set categoria(categoria) {
        this.#categoria = String(categoria);
    }

    // Método toJSON
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            descripcion: this.#descripcion,
            precio: Number(this.#precio.toFixed(2)),
            stock: this.#stock,
            descuento: this.#descuento,
            categoria: this.#categoria
        };
    }
}

module.exports = Producto;