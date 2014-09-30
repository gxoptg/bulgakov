var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var lessMiddleware = require("less-middleware");

var userSideRouter = require("./routes/reader-side");
var apiPostsRouter = require("./routes/api_posts");

var AppError = require("./core/apperror");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.locals.basedir = __dirname;

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// Prohibit access to .jade files
app.use("*.jade", function(req, res, next) {
    next(AppError.pageNotFound);
});
app.use("/blocks", lessMiddleware(path.join(__dirname, "blocks")));
app.use(lessMiddleware(path.join(__dirname, "public")));
// Alias /blocks to /public/blocks
app.use("/blocks", express.static(path.join(__dirname, "blocks")));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userSideRouter);
app.use("/api/posts", apiPostsRouter);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(AppError.pageNotFound);
});

// Error handler
app.use(function (error, req, res, next) {
    if (error.stack) {
        console.error(error.stack);
    }

    res.status(error.httpStatus);
    res.render("error", {
        error: error
    });
});


module.exports = app;
