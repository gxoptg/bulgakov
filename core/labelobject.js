/** @module labelobject */

var _ = require("underscore");
var check = require("check-types");
var common = require("./common");
var DataObject = require("./dataobject");

/**
 * Represents a label object.
 * @augments DataObject
 * @alias module:labelobject
 * @constructor
 */
function LabelObject() {
    DataObject.call(this);
}

/**
 * Checks whether the passed object can be converted to a label object.
 * @param {Object} object
 * @returns {boolean}
 */
LabelObject.canBeConverted = function(object) {
    return common.validate(object, keys, validators);
};

/**
 * Converts the passed object to a label object.
 * @param {Object} object
 * @returns {LabelObject|null} Label object or null, if conversion was unsuccessful.
 */
LabelObject.fromJSON = function(object) {
    return DataObject.fromJSON(object, keys, validators);
};

var keys = [];
var validators = {};

/**
 * Label id.
 * @type {number}
 */
LabelObject.prototype._id = 0;
validators._id = check.int;

/**
 * Label text.
 * @type {string}
 */
LabelObject.prototype.label = "";
validators.label = check.unemptyString;

keys = _.keys(validators);

module.exports = LabelObject;