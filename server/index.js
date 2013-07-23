'use strict';

var express = require('express');

var app = express();
var passport = require('passport');

var Authentication = require('./authentication');

app.use(express.logger('dev'));

// marker for `grunt-express` to inject static folder/contents
app.use(function staticsPlaceholder(req, res, next) {
  return next();
});

app.use(express.cookieParser());
app.use(express.session({secret: 'foljkfdsa932ljf9'}));
app.use(express.bodyParser());

// Add csrf support
app.use(express.csrf({value: Authentication.csrf}));
app.use(function(req, res, next) {
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

app.post('/login', Authentication.login);
app.get('/logout', Authentication.logout);

app.get('/user', Authentication.ensureAuthenticated, function(req, res) {
  return res.json(req.session.user);
});

var Product = require('./model').Product;

app.get('/api/products', Authentication.authenticateApi, function(req, res) {
  Product.find().lean(true)
    .exec()
    .then(function(products) {
      return res.send(products);
    })
    .then(null, function(err) {
      console.log(err);
      return res.send(500);
    });
});

app.get('/api/products/:productId', Authentication.authenticateApi, function(req, res) {
  Product
    .findById(req.params.productId)
    .lean(true)
    .exec()
    .then(function(product) {
      return res.send(product);
    })
    .then(null, function(err) {
      console.log(err);
      return res.send(500);
    });
});

module.exports = app;