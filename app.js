var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer')

var userRouter = require('./routes/user');
var employerRouter = require('./routes/employers');
var adminRouter = require('./routes/admin');

var hbs = require('express-handlebars')
var app = express();
var db = require('./config/connections');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs', defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "key",cookie: { maxAge:600000 }}));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(fileUpload());

db.connect((err)=>{
  if (err) 
    console.log("Database connection error due to "+err)  
  else  
    console.log(" !!! JOB PORTAL DB Connected Successfully !!! ")
})

app.use('/', userRouter);
app.use('/employers', employerRouter);
app.use('/admin', adminRouter);

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

module.exports = app;
