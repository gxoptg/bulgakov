/** @module parser */

var marked = require("marked");

/**
 * Compiles user's content (such as post body) from the representation (currently Markdown) to HTML.
 * @param {string} content
 * @returns {string} Compiled content.
 */
function compile(content) {
    var result;
    result = marked(content);
    return result;
}

exports.compile = compile;