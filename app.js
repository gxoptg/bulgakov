var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');

var userSideRouter = require("./routes/userside");
var apiPostsRouter = require("./routes/api_posts");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public'), { force: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", userSideRouter);
app.use("/api/posts", apiPostsRouter);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
