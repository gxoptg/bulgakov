/** @module postobject */

var _ = require("underscore");
var check = require("check-types");
var common = require("./common");
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

// Defining properties and methods
var keys = [];
var validators = {};
var convertersFromJSON = {};
var convertersToJSON = {};

/**
 * Post title.
 * @type {string}
 */
PostObject.prototype.title = "";
validators.title = check.unemptyString;

/**
 * Post body in markdown.
 * @type {string}
 */
PostObject.prototype.mdBody = "";
validators.mdBody = check.unemptyString;

/**
 * Post body compiled from Markdown to HTML.
 * @type {string}
 */
PostObject.prototype.cachedHtmlBody = "";
validators.cachedHtmlBody = check.unemptyString;

/**
 * Labels attached to the post. Each element of the array is a label id.
 * @type {number[]}
 */
PostObject.prototype.labels = [];
validators.labels = check.array;

/**
 * Post description for search engines.
 * @type {string}
 */
PostObject.prototype.searchDescription = "";
validators.searchDescription = check.string;

/**
 * Post keywords for search engines.
 * @type {string[]}
 */
PostObject.prototype.searchKeywords = [];
validators.searchKeywords = check.array;

/**
 * URL of post image for social networks.
 * @type {string}
 */
PostObject.prototype.socialImage = "";
validators.socialImage = check.webUrl;

/**
 * Post title for social networks.
 * @type {string}
 */
PostObject.prototype.socialTitle = "";
validators.socialTitle = check.string;

/**
 * Post description for social networks.
 * @type {string}
 */
PostObject.prototype.socialDescription = "";
validators.socialDescription = check.string;

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
 * @returns {PostObject|null} Post object or null, if conversion was unsuccessful.
 */
PostObject.fromJSON = function(object) {
    var dataObject = DataObject.fromJSON(object, keys, validators, convertersFromJSON);
    if (dataObject) {
        return _.extend(new PostObject(), dataObject);   // Performing a cast
    } else {
        return null;
    }
};

/**
 * Converts current object to JSON representation.
 * @returns {Object}
 */
PostObject.prototype.toJSON =  function() {
    return DataObject.prototype.toJSON.call(this, convertersToJSON);
};

module.exports = PostObject;