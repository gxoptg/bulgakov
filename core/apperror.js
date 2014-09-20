/** @module apperror */

var _ = require("underscore");
var httpStatus = require("http-status-codes");

/**
 * Creates an error object for app inner errors.
 * @alias module:apperror
 * @param {string} message Error message.
 * @param {number} [code] Error code.
 * @param {number} [httpStatus] HTML reply status used for this error.
 * @constructor
 */
function AppError(message, code, httpStatus, suspendConsole) {
    Error.call(this);

    if (!suspendConsole) {
        console.trace("New error constructed.");
    }

    if (_.isUndefined(code)) {
        code = null;
    }

    if (_.isUndefined(httpStatus)) {
        httpStatus = null;
    }

    this.code = code;
    this.message = message;
    this.httpStatus = httpStatus;
}

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;
AppError.prototype.name = "AppError";

/**
 * Returns the data object that can be returned to a client.
 * @returns {{code: number, message: string}}
 */
AppError.prototype.publicData = function() {
    return {
        code: this.code,
        message: this.message
    };
};

/** @type {number} */
AppError.prototype.code = 0;
/** @type {string} */
AppError.prototype.message = "";
/** @type {number} */
AppError.prototype.httpStatus = httpStatus.OK;

/**
 * Finds and returns basic error by its code.
 * @param {number} errorCode
 * @returns {AppError}
 */
AppError.byCode = function(errorCode) {
    var basicErrorNames = _.keys(AppError.basic);
    var errorName = _.find(basicErrorNames, function(currentErrorName) {
        return AppError.basic[currentErrorName].code === errorCode;
    });

    return AppError.basic[errorName];
};

var errorCode = 1;  // For creating basic app errors.
AppError.wrongIdFormat = new AppError("The ID must be an integer", errorCode++, httpStatus.BAD_REQUEST, true);
AppError.wrongObjectFormat = new AppError("Wrong object format", errorCode++, httpStatus.BAD_REQUEST, true);
AppError.badRequest = new AppError("Bad request", errorCode++, httpStatus.BAD_REQUEST, true);
AppError.unauthorized = new AppError("Authorization is required", errorCode++, httpStatus.UNAUTHORIZED, true);
AppError.wrongMethod = new AppError("Wrong access method", errorCode++, httpStatus.METHOD_NOT_ALLOWED, true);
AppError.internalError = new AppError("Internal server error", errorCode++, httpStatus.INTERNAL_SERVER_ERROR, true);
AppError.notImplemented = new AppError("Not implemented yet", errorCode++, httpStatus.NOT_IMPLEMENTED, true);
AppError.dbError = new AppError("Database error", errorCode++, httpStatus.INTERNAL_SERVER_ERROR, true);
AppError.noObjectFound = new AppError("No object was found", errorCode++, httpStatus.NOT_FOUND, true);
AppError.pageNotFound = new AppError("Page not found", errorCode++, httpStatus.NOT_FOUND, true);

module.exports = AppError;
