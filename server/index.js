'use strict';

var uid            = require('uid2');
var express        = require('express');
var passport       = require('passport');
var Authentication = require('./authentication');

var app            = express();

app.use(express.logger('default'));

// marker for `grunt-express` to inject static folder/contents
app.use(function staticsPlaceholder(req, res, next) {
  return next();
});

app.use(express.cookieParser());
app.use(express.session({secret: process.env.SESSION_SECRET}));
app.use(express.bodyParser());

// Add csrf support
app.use(function(req, res, next) {
  req.session._csrf = req.session._csrf || (req.session._csrf = uid(24));
  res.cookie('XSRF-TOKEN', req.session._csrf);
  next();
});

// setup passport authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(Authentication.localStrategy);
passport.use(Authentication.basicStrategy);
passport.serializeUser(Authentication.serializeUser);
passport.deserializeUser(Authentication.deserializeUser);

app.post('/login', express.csrf({value: Authentication.csrf}), Authentication.login);
app.get('/logout', Authentication.logout);

app.get('/user', Authentication.ensureAuthenticated, function(req, res) {
  return res.json(req.session.user);
});

var api = require('./api');

var apiauth = express();
apiauth.use(Authentication.authenticateApi);
apiauth.use(api);

var ajaxapi = express();
ajaxapi.use(Authentication.ensureAuthenticated);
ajaxapi.use(express.csrf({value: Authentication.csrf}));
ajaxapi.use(api);

app.use('/api', apiauth);
app.use('/ajax', ajaxapi);

module.exports = app;
