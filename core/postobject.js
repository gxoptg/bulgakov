/** @module postobject */

var _ = require("underscore");
var check = require("check-types");
var common = require("./common");
var contentCompiler = require("./contentcompiler");
var DataObject = require("./dataobject");

/**
 * Represents a post object.
 * @augments DataObject
 * @alias module:postobject
 * @constructor
 */
function PostObject() {
    DataObject.call(this);
}

PostObject.prototype = Object.create(DataObject.prototype);
PostObject.prototype.constructor = PostObject;

/**
 * Compiles plain body, saves it to the post object and passes it to the callback.
 * @returns {string} Compiled body.
 */
PostObject.prototype.compileBody = function() {
    this.compiledBody = contentCompiler.compile(this.plainBody);
    return this.compiledBody;
};

// Defining properties and methods
var keys = [];
var validators = {};
var convertersFromJSON = {};
var convertersToJSON = {};

/**
 * Post id.
 * @type {number}
 * @public
 */
PostObject.prototype._id = 0;
validators._id = check.maybe.intNumber;

/**
 * Post title.
 * @type {string}
 */
PostObject.prototype.title = "";
validators.title = check.unemptyString;

/**
 * Post body in plain format (currently Markdown).
 * @type {string}
 */
PostObject.prototype.plainBody = "";
validators.plainBody = check.unemptyString;

/**
 * Post body compiled from plain format to HTML.
 * @type {string}
 */
PostObject.prototype.compiledBody = "";
validators.compiledBody = check.maybe.unemptyString;

/**
 * Labels attached to the post. Each element of the array is a label text.
 * @type {string[]}
 */
PostObject.prototype.labels = [];
validators.labels = check.array;

/**
 * Post publication date.
 * @type {Date}
 */
PostObject.prototype.publicationDate = new Date();
validators.publicationDate = function(stringRepresentation) { // In JSON, date is stored in string.
    return !isNaN(Date.parse(stringRepresentation));
};
convertersFromJSON.publicationDate = function(string) {
    return new Date(string);
};
convertersToJSON.publicationDate = function(date) {
    return date.toJSON();
};

keys = _.keys(validators);

/**
 * Checks whether the passed object can be converted to a post object.
 * @param {Object} object
 * @returns {boolean}
 */
PostObject.canBeConverted = function(object) {
    return common.validate(object, keys, validators);
};

/**
 * Converts the passed object to a post object.
 * @param {Object} object
 * @returns {PostObject} Post object or null, if conversion was unsuccessful.
 */
PostObject.fromJSON = function(object) {
    var dataObject = DataObject.fromJSON(object, keys, validators, convertersFromJSON);
    var postObject = null;

    if (dataObject) {
        postObject = _.extend(new PostObject(), dataObject);   // Performing a type cast
        if (!postObject.compiledBody) {
            postObject.compileBody();
        }
    }

    return postObject;
};

/**
 * Converts current object to JSON representation.
 * @returns {Object}
 */
PostObject.prototype.toJSON =  function() {
    return DataObject.prototype.toJSON.call(this, convertersToJSON);
};

module.exports = PostObject;