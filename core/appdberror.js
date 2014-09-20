/** @module appdberror */

var AppError = require("./apperror");

/**
 * Constructs app error object extended with database error description.
 * @alias module:appdberror
 * @augments AppError
 * @param {*} description Error object returned by the database.
 * @constructor
 */
function AppDbError(description) {
    AppError.call(this, AppError.dbError.message, AppError.dbError.code, AppError.dbError.httpStatus);

    this.dbErrorDescription = description;
}

AppDbError.prototype = Object.create(AppError.prototype);
AppDbError.prototype.constructor = AppDbError;
AppDbError.prototype.name = "AppDbError";

/**
 * Returns public data of AppError extended with dbErrorDescription property.
 * @return {{code: number, message: string, dbErrorDescription: *}}
 */
AppDbError.prototype.publicData = function() {
    var data = AppError.prototype.publicData.call(this);
    data.dbErrorDescription = this.dbErrorDescription;
    return data;
};

/**
 * Contains error object returned by request to the database.
 * @type {*}
 */
AppDbError.prototype.dbErrorDescription = null;

module.exports = AppDbError;