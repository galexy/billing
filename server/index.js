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

var model = require('./model');

app.get('/api/products', Authentication.authenticateApi, function(req, res) {
  model.Product.find().lean(true).exec()
    .then(res.send.bind(res), function(err) {
      console.log(err);
      return res.send(500);
    });
});

app.get('/api/products/:productId', Authentication.authenticateApi, function(req, res) {
  model.Product.findById(req.params.productId).lean(true).exec()
    .then(function(product) {
      if (product == null) {
        return res.send(400);
      }
      return res.send(product);
    })
    .then(null, function(err) {
      console.log(err);
      return res.send(500);
    });
});

app.put('/api/products/:productId', Authentication.authenticateApi, function(req, res) {
  // TODO: understand if _.assign destroys mongoose object and therefore preventing validation
  model.Product.findById(req.params.productId).exec()
    .then(function(product) {
      var updatedProduct = _.assign(product, req.body);
      var p = new mongoose.Promise();
      updatedProduct.save(function(err, savedProduct) {
        if (err) {
          return p.error(err);
        }
        p.complete(savedProduct);
      });
      return p;
    })
    .then(res.send.bind(res, 200), function(err) {
      console.log(err);
      return res.send(500);
    });
});

app.get('/api/subscribers', Authentication.authenticateApi, function(req, res) {
  model.Subscriber.find().populate('statements').lean(true).exec()
    .then(res.send.bind(res), function(err) {
      console.log(err);
      return res.send(500);
    });
});

app.post('/api/subscribers', Authentication.authenticateApi, function(req, res) {
  var p = new mongoose.Promise();
  model.Subscriber.findOrCreate(req.body, function(err, subscriber) {
    if (err) {
      return p.error(err);
    }
    p.complete(subscriber);
  });

  p.then(res.send.bind(res), function(err) {
    console.log(err);
    return res.send(500);
  });
});

app.get('/api/subscribers/:subscriberId', Authentication.authenticateApi, function(req, res) {
  model.Subscriber.findById(req.params.subscriberId).populate('statements').lean(true).exec()
    .then(res.send.bind(res), function(err) {
      console.log(err);
      return res.send(500);
    });
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

module.exports = app;
