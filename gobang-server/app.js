var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var showdown  = require('showdown');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.engine('md', function(path, options, fn) {
    console.log(path);
    fs.readFile(path, 'utf8', function(err, str) {
        if (err) return fn(err);
        var converter = new showdown.Converter();
        var hljcss = '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.14.2/styles/default.min.css">';
        var hljjs = '<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.14.2/highlight.min.js"></script>'; 
        str = converter.makeHtml(str)
        str = `<head>${hljcss}</head>` + str;
        str += hljjs;
        str += `<script>
			document.querySelectorAll('pre code').forEach((block) => {
			    hljs.highlightBlock(block);
			});
		</script>`
        fn(null, str);
    });
});

module.exports = app;