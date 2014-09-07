/**
 * @module common
 */

var _ = require("underscore");

/**
 * Copies specified keys from one object to another.
 * @param {object} fromObject
 * @param {object} toObject
 * @param {string[]} keys Keys to copy.
 */
function copyFields(fromObject, toObject, keys) {
    _.each(keys, function(key) {
        toObject[key] = fromObject[key];
    });
}

/**
 * Validates object keys with validators.
 * @param {Object} object Object to validate.
 * @param {string[]} keys Keys to validate. (Only these keys will be validated.)
 * @param {Object.<string, function>} validators Functions to validate each key.
 * @returns {boolean} True, if passed object is valid, otherwise false.
 */
function validate(object, keys, validators) {
    var isValid = true;

    _.each(keys, function(key) {
        var validateKey = validators[key];
        var validatedKey = object[key];

        if (!validateKey(validatedKey)) {
            isValid = false;
        }
    });

    return isValid;
}

exports.copyFields = copyFields;
exports.validate = validate;