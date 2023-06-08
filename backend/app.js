let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let cors = require('cors')

let HealthCheckRouter = require('./routes/healthcheck');
let signInRouter = require('./routes/account/sign_in');
let signUpRouter = require('./routes/account/sign_up');
let snapShotRouter = require('./routes/analysis/snapshot')
let lensInfoRouter = require('./routes/analysis/lens_info')
let exchangeRateRouter = require('./routes/exchange_rate')
let demoRouter = require('./routes/demo')

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/healthcheck', HealthCheckRouter);
app.use('/api/1.0/signIn', signInRouter);
app.use('/api/1.0/signUp', signUpRouter);
app.use('/api/1.0/snapshot', snapShotRouter);
app.use('/api/1.0/lensInfo', lensInfoRouter);
app.use('/api/1.0/exchangeRate', exchangeRateRouter);
app.use('/api/1.0/demo', demoRouter);

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
