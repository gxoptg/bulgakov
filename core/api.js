/** @module api */

var _ = require("underscore");
var monk = require("monk");
var common = require("./common");
var AppError = require("./apperror");
var AppDbError = require("./appdberror");
var PostObject = require("./postobject");

var db = monk('localhost:27017/nodejscms');
var postsCollection = db.get("posts");
postsCollection.ensureIndex({id: -1}, {unique: true});
var api = { posts: {} };

/**
 * Publishes a new post.
 * @param {PostObject} post Post object to post.
 * @param {postCallback} callback
 */
api.posts.post = function(post, callback) {
    var jsonDocument = post.toJSON();

    // Get the free (available) post id
    reservePostId(function(reserveIdError, freePostId) {
        if (reserveIdError) {
            callCallbackError(callback, reserveIdError);
            return;
        }

        // MongoDB requires _id attribute.
        jsonDocument._id = freePostId;
        postsCollection.insert(jsonDocument, function(dbError) {
            if (dbError) {
                callCallbackError(callback, new AppDbError(dbError));
            } else {
                callCallbackResult(callback, freePostId);
            }
        });
    });
};

/**
 * Gets a post from the database.
 * @param {number} postId Post id to retrieve from the database.
 * @param {postCallback} callback
 */
api.posts.get = function(postId, callback) {
    postsCollection.findById(postId, function(dbError, document) {
        var noDocumentFound = document === null;

        if (dbError) {
            callCallbackError(callback, new AppDbError(dbError));
        } else if (noDocumentFound) {
            callCallbackError(callback, AppError.noObjectFound);
        } else {
            callCallbackResult(callback, PostObject.fromJSON(document));
        }
    });
};

/**
 * Updates a post in the database.
 * @param {number} postId A post id to update.
 * @param {PostObject} postObject A new post content.
 * @param {postCallback} callback
 */
api.posts.update = function(postId, postObject, callback) {
    var jsonDocument = postObject.toJSON();

    postsCollection.updateById(postId, jsonDocument, function(dbError, updatedCount) {
        if (dbError) {
            callCallbackError(callback, new AppDbError(dbError));
        } else if (updatedCount === 0) {
            callCallbackError(callback, AppError.noObjectFound);
        } else {
            callCallbackResult(callback, postId);
        }
    });
};

/**
 * Removes a post from the database.
 * @param {number} postId ID of the post to delete.
 * @param {postCallback} callback
 */
api.posts.remove = function(postId, callback) {
    postsCollection.remove({ _id: postId }, function(dbError, removedCount) {
        if (dbError) {
            callCallbackError(callback, new AppDbError(dbError));
        } else if (removedCount === 0) {
            callCallbackError(callback, AppError.noObjectFound);
        } else {
            callCallbackResult(callback, postId);
        }
    });
};

/**
 * Returns a list of post objects sorted by date created (newer are first).
 * @param {number} offset How many posts skip.
 * @param {number} count How many results return.
 * @param {postCallback} callback
 */
api.posts.list = function(offset, count, callback) {
    postsCollection.find({}, { sort: {_id: -1}, skip: offset, limit: count},
        function(dbError, documents) {
            if (dbError) {
                callCallbackError(callback, new AppDbError(dbError));
            } else {
                // Converting all JSON documents returned by the DB to post objects.
                var postObjects = [];
                _.forEach(documents, function(dbDocument) {
                    postObjects.push( PostObject.fromJSON(dbDocument) );
                });
                callCallbackResult(callback, postObjects);
            }
        }
    );
};

/**
 * Finds number of all posts in the database.
 * @param {postCallback} callback
 */
api.posts.count = function(callback) {
    postsCollection.count({}, function(dbError, postsCount) {
        if (dbError) {
            callCallbackError(callback, dbError);
        } else {
            callCallbackResult(callback, postsCount);
        }
    })
};

/**
 * Reserves an available post id and returns it via callback.
 * @function reservePostId
 * @param {postIdCallback} callback
 */
var reservePostId = (function() {
    // Using self-invokable function to save value of cachedFreeId between reservePostId() calls.
    var cachedFreeId = null;
    var START_ID = 1;

    // Actual function body
    return function(callback) {
        // If no id was cached yet
        if (cachedFreeId === null) {
            // ...Retrieving the latest DB record. It must have the maximum "_id" value.
            var lastDbRecord = postsCollection.find({}, {sort: {_id: -1}, limit: 1, fields: {_id: 1}});

            lastDbRecord.error(function(dbError) {
                callCallbackError(callback, new AppDbError(dbError));
            });

            lastDbRecord.success(function(docsArray) {
                // Saving retrieved id.

                // The request to the DB always returns one document except the case when there are no documents in it.
                var document = docsArray[0];
                var documentExists = typeof document !== "undefined";

                // If there are no documents in the DB, we use START_ID.
                cachedFreeId = documentExists ? document._id + 1: START_ID;

                callCallbackResult(callback, cachedFreeId);

                // Increasing cachedFreeId, because we've just given free id (cachedFreeId + 1) to reserve.
                ++cachedFreeId;
            });

        } else {
            // Just using cached value.
            callCallbackResult(callback, cachedFreeId);
            ++cachedFreeId;
        }
    };
})();

/**
 * Calls a callback with an error object.
 * @param {postCallback} callback
 * @param {(AppError|AppDbError)} error
 */
function callCallbackError(callback, error) {
    setImmediate(callback, error, null);
}

/**
 * Calls a callback with a result.
 * @param {postCallback} callback
 * @param {(number|PostObject|PostObject[])} result
 */
function callCallbackResult(callback, result) {
    setImmediate(callback, null, result);
}

/**
 * @callback postCallback
 * @param {(AppError|AppDbError)} error
 * @param {*} result
 */

module.exports = api;