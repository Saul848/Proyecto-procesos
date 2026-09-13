/**
 * Representa a un empleado
 *
 * @typedef {Object} Empleado
 * @property {number} id - Identificador unico del empleado.
 * @property {string} nombre - Nombre del empleado.
 * @property {string} puesto - Puesto del empleado.
 * @property {number} telefono - Numero telefonico del empleado .
 * @property {string} usuario - Nombre de usuario del empleado.
 * @property {string} password - Contraseña del usuario del empleado.
 * @property {number} numVentas - Numero de ventas totales realizadas por el empleado.
 * @property {number} numTransacciones - Numero de ventas totales realizadas por el empleado.
*/ 

/**
 * Clase que representa a un empleado.
 *
 * Contiene la información básica del empleado.
 *
 * @class Empleado
 */
class Empleado {

    /**
     * Identificador unico del empleado
     *
     * @type {number}
     */
    #id;

    /**
     * Nombre completo del empleado.
     *
     * @type {string}
     */
    #nombre;

    /**
     * Puesto del empleado.
     *
     * @type {string}
     */
    #puesto;

    /**
     * Telefono del empleado
     * 
     */
    #telefono

    #usuario

    #password

    #numVentas

    #numTransaciones

    /**
     * Constructor que crea una instancia de empleado
     * @param {number} id Id del empleado
     * @param {string} nombre nombre del empleado
     * @param {string} puesto puesto del empleado
     * @param {number} telefono telefono del empleado
     * @param {string} usuario usuario del empleado
     * @param {string} password password del empleado
     * @param {number} numVentas numero total de ventar realizadas
     * @param {number} numTransacciones numero total de transacciones realizadas
     */
    constructor(id = "", nombre = "", puesto = "", telefono ="", usuario="", password="", numVentas="", numTransacciones="") {
        this.#id = parseInt(id);
        this.#nombre = nombre;
        this.#puesto = puesto;
        this.#telefono = parseInt(telefono);
        this.#usuario = usuario;
        this.#password = password;
        this.#numVentas = numVentas;
        this.#numTransaciones = numTransacciones;
    }

    /**
     * Obtiene el id del empleado
     *
     * @returns {number} Id del empleado.
     */
    get id() {
        return this.#id;
    }

    /**
     * Obtiene el nombre completo del empleado.
     *
     * @returns {string} Nombre completo del empleado.
     */
    get nombre() {
        return this.#nombre;
    }

    /**
     * Obtiene el puesto del empleado.
     *
     * @returns {string} Puesto del empleado.
     */
    get puesto() {
        return this.#puesto;
    }


    /**
     * Obtiene el usuario del empleado.
     *
     * @returns {string} Usuario del empleado.
     */
    get usuario() {
        return this.#usuario;
    }

    
    /**
     * Obtiene la contraseña del empleado.
     *
     * @returns {password} Contraseña del empleado.
     */
    get password() {
        return this.#password;
    }

    /**
     * Obtiene el numero de ventas del empleado.
     *
     * @returns {number} Numero de ventas del empleado.
     */
    get ventas() {
        return this.#numVentas;
    }

    /**
     * Obtiene el numero de transacciones hechas por el empleado.
     *
     * @returns {number} numero de transacciones hechas por el empleado.
     */
    get numTransacciones() {
        return this.#numTransaciones;
    }

    /**
     * Modifica el id del empleado.
     *
     * @param {number} nId - Nuevo id del empleado.
     * @returns {void}
     */
    set id(nId) {
        this.#id = nId;
    }

    /**
     * Modifica el nombre del empleado.
     *
     * @param {string} nNombre - Nuevo nombre completo del empleado.
     * @returns {void}
     */
    set nombre(nNombre) {
        this.#nombre = nNombre;
    }

    /**
     * Modifica el puesto del empleado.
     *
     * @param {string} nPuesto - Nuevo puesto del empleado.
     * @returns {void}
     */
    set puesto(nPuesto) {
        this.#puesto = nPuesto;
    }

    /**
     * Modifica el telefono del empleado.
     *
     * @param {number} nTel - Nuevo telefono del empleado.
     * @returns {void}
     */
    set telefono(nTel) {
        this.#telefono = nTel;
    }

    /**
     * Modifica el usuario del empleado.
     *
     * @param {string} nUsuario - Nuevo usuario del empleado.
     * @returns {void}
     */
    set usuario(nUsuario) {
        this.#usuario = nUsuario;
    }

    /**
     * Modifica la contraseña del empleado.
     *
     * @param {string} nPsw - Nueva contraseña del empleado.
     * @returns {void}
     */
    set password(nPsw) {
        this.#password = nPsw;
    }

    /**
     * Modifica el numero de ventas del empleado.
     *
     * @param {number} nVentas - Nuevo numero de ventas del empleado.
     * @returns {void}
     */
    set numVentas(nVentas) {
        this.#numVentas = nVentas;
    }

    /**
     * Modifica el numero de transacciones hechas por el empleado.
     *
     * @param {number} nTrsn - Nuevo numero de transacciones del empleado.
     * @returns {void}
     */
    set numTransacciones(nTrsn) {
        this.#numTransaciones = nTrsn;
    }

    /**
     * Convierte la instancia de Empleado en un objeto.
     *
     * Este método es utilizado automáticamente por JSON.stringify()
     * cuando se convierte una instancia de Empleado a JSON.
     *
     * @returns {Object} Objeto con los datos del Empleado.
     */
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            puesto: this.#puesto,
            telefono: this.#telefono,
            usuario: this.#usuario,
            password: this.#password,
            numVentas: this.#numVentas,
            numTransacciones: this.#numTransaciones
        };
    }
}

module.exports = Empleado;