/** @module parser */

var marked = require("marked");

/**
 * Parses user's content (such as post body) from the representation (currently Markdown) to HTML.
 * @param {string} content
 * @param {parserCallback} callback
 */
function compile(content, callback) {
    var result;
    result = marked(content);
    setImmediate(callback, result);
}

/**
 * Callback for the parser. It is called when parsing is finished with only result parameter.
 * Content is tried to compile despite any errors (like HTML) so no error parameter is provided.
 * @callback parserCallback
 * @param {string} result Parse result.
 */

exports.compile = compile;