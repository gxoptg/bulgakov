/**
 @module dataobject
 */

var _ = require("underscore");
var common = require("./common");

/**
 * The base for objects—interfaces for data stored in the DB, e.g. for PostObject and LabelObject.
 * @alias module:dataobject
 * @constructor
 */
function DataObject() {

}

/**
 * Converts the passed object to a new data object.
 * @param {Object} object JavaScript object to convert.
 * @param {string[]} keys Field keys that must be copied to from object to new data object when converting.
 *
 * @param {Object.<string, function>} validators Validators for keys that are being copied.
 * Note that a field is being validated before its conversion to the right value (see converters parameter)
 * so you must validate the non-converted value (e.g. for date validate its string representation, not Date object).
 *
 * @param {Object.<string, function>} converters Additional functions to call for converting a value.
 * For example, if a "date" field is stored in JSON as string and, when converting to a data object, must be converted
 * to a Date object, provide the "date" field in converters which value is a function which accepts the original value
 * and returns accepted.
 *
 * @returns {(DataObject|null)} Converted object or null, if conversion was unsuccessful.
 */
DataObject.fromJSON = function(object, keys, validators, converters) {
    if (object === null) {
        return null;
    }
    if (!common.validate(object, keys, validators)) {
        return null;
    }

    var dataObject = new DataObject();

    var fieldsToConvert = _.keys(converters);
    var fieldsToCopy = _.difference(keys, fieldsToConvert); // Copying only fields which aren't converted

    // Copying fields
    common.copyFields(object, dataObject, fieldsToCopy);

    // Converting fields
    _.each(fieldsToConvert, function(fieldToConvert) {
        var convert = converters[fieldToConvert];
        dataObject[fieldToConvert] = convert(object[fieldToConvert]);
    });

    // Saving some values
    Object.defineProperties(dataObject, {
        /**
         * Public keys of DataObject.
         * @member {string[]} publicKeys
         */
        publicKeys: {
            /* non-configurable, non-writable */
            enumerable: true,
            value: keys
        },
        /**
         * Validators for public keys of DataObject.
         * @member {Object.<string, function>} validators
         * @private
         */
        validators: {
            /* non-configurable, non-enumerable, non-writable */
            value: validators
        }
    });

    return dataObject;
};

/**
 * Converts this data object to valid JSON object which can be used for sending to a client or storing in the database.
 * @param {Object<string, function>} converters Functions that must be applied to some fields when converting to JSON.
 * For example, to convert a "date" field which contains Date object to its string representation,
 * provide the "date" field in the converters object which value is a function that converts Date object to string.
 * @returns {Object} Converted JSON object.
 */
DataObject.prototype.toJSON = function(converters) {
    var jsonObject = {};

    var fieldsToConvert = _.keys(converters);
    var fieldsToCopy = _.difference(this.publicKeys, fieldsToConvert); // Copying only fields which aren't converted

    // Copying fields
    common.copyFields(this, jsonObject, fieldsToCopy);

    // Converting fields
    _.each(fieldsToConvert, function(fieldToConvert) {
        var convert = converters[fieldToConvert];
        jsonObject[fieldToConvert] = convert(this[fieldToConvert]);
    }.bind(this));

    return jsonObject;
};

module.exports = DataObject;