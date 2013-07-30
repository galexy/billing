'use strict';

var _              = require('lodash');
var express        = require('express');
var passport       = require('passport');
var mongoose       = require('mongoose');

var app            = express();
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

var model   = require('./model');
var billing = require('./lib/billing');

function sendRes(obj) {
  return (null == obj)
    ? this.send(400)
    : this.send(obj);
}

function sendSuccess() {
  this.send(200);
}

function sendError(err) {
  console.log(err);
  console.log(err.stack);
  // TODO: base status on error type/information
  return this.send(500);
}

app.get('/api/products', Authentication.authenticateApi, function(req, res) {
  billing.products
    .findAll()
    .then(sendRes.bind(res), sendError.bind(res));
});

app.get('/api/products/:productId', Authentication.authenticateApi, function(req, res) {
  billing.products
    .findById(req.params.productId)
    .then(sendRes.bind(res), sendError.bind(res));
});

app.put('/api/products/:productId', Authentication.authenticateApi, function(req, res) {
  if (req.body._id != req.params.productId) {
    return res.send(400); // TODO: send error type/code
  }

  billing.products
    .update(req.body)
    .then(sendSuccess.bind(res), sendError.bind(res));
});

app.get('/api/subscribers', Authentication.authenticateApi, function(req, res) {
  billing.subscribers
    .findAll()
    .then(sendRes.bind(res), sendError.bind(res));
});

app.post('/api/subscribers', Authentication.authenticateApi, function(req, res) {
  billing.subscribers
    .create(req.body)
    .then(sendRes.bind(res), sendError.bind(res));
});

app.get('/api/subscribers/:subscriberId', Authentication.authenticateApi, function(req, res) {
  billing.subscribers
    .findById(req.params.subscriberId)
    .then(sendRes.bind(res), sendError.bind(res));
});

app.put('/api/subscribers/:subscriberId', Authentication.authenticateApi, function(req, res) {
  model.Subscriber.findById(req.params.subscriberId).exec()
    .then(function(subscriber) {
      var updatedSubscriber = _.assign(subscriber, req.body);
      var p = new mongoose.Promise();
      updatedSubscriber.save(function(err, savedSubscriber) {
        if (err) {
          return p.error(err);
        }
        return p.complete(savedSubscriber);
      });
      return p;
    })
    .then(res.send.bind(res), function(err) {
      console.log(err);
      res.send(500);
    });
});

app.del('/api/subscribers/:subscriberId', Authentication.authenticateApi, function(req, res) {
  var p = new mongoose.Promise();
  model.Subscriber.remove({_id: req.params.subscriberId}, function(err) {
    if (err) {
      return p.error(err);
    }

    return p.complete();
  });

  p.then(res.send.bind(res, 200), function(err) {
    console.log(err);
    res.send(500);
  });
});

app.post('/api/subscribers/:subscriberId/addCard', Authentication.authenticateApi, function(req, res) {
  billing.subscribers.addCard(req.params.subscriberId, req.query.token)
    .then(sendRes.bind(res), sendError.bind(res));
});

app.post('/api/subscribers/:subscriberId/addSubscription', Authentication.authenticateApi, function(req, res) {
  billing.subscribers.addSubscription(req.params.subscriberId, req.query.product, req.query.plan)
    .then(sendRes.bind(res), sendError.bind(res));
});

module.exports = app;
