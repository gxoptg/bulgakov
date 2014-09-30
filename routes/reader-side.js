/**
 * Router for the user side (reader interface).
 * @module userside
 */

var _ = require("underscore");
var check = require("check-types");
var express = require("express");
var api = require("../core/api");
var common = require("../core/common");
var AppError = require("../core/apperror");

var router = express.Router();

// List all posts by pages
router.get("/", function(req, res, next) {
    // Validating request
    var requiredPage = parseInt(req.query.page);
    if (_.isNaN(requiredPage)) {
        requiredPage = 1;
    }

    if (requiredPage < 1) {
        next(AppError.badRequest);
        return;
    }

    // Count total number of posts
    api.posts.count(function(appError, totalPostsCount) {
        if (appError) {
            next(appError);
        }

        var totalPages = Math.ceil(totalPostsCount / common.postsPerPage);
        // Note: the following is correct because required page number starts from 1. Yeah, like in oldschool Pascal.
        if (requiredPage > totalPages) {
            next(AppError.badRequest);
        }

        var requiredOffset = (requiredPage - 1) * common.postsPerPage;
        var requiredCount = common.postsPerPage;

        // Get list of required posts
        api.posts.list(requiredOffset, requiredCount, function(appError, posts) {
            if (appError) {
                next(appError);
            }

            var data = {
                page: requiredPage,
                totalPages: totalPages,
                posts: posts
            };

            // Render
            res.render("posts-page", data);
        });
    });
});

// A specified post
router.get("/post/:id", function(req, res, next) {
    var postId = parseInt(req.params.id);

    // Check whether id is correct
    if (!check.intNumber(postId)) {
        next(AppError.wrongIdFormat);
        return;
    }

    api.posts.get(postId, function(appError, postObject) {
        if (appError) {
            next(appError);
            return;
        }

        var data = {
            post: postObject
        };

        res.render("post-page", data);
    });
});

module.exports = router;
