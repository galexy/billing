'use strict';

var _        = require('lodash');
var express  = require('express');
var model    = require('./model');
var billing  = require('./lib/billing');
var mongoose = require('mongoose');

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

var api = express();

api.get('/products', function(req, res) {
  billing.products
    .findAll()
    .then(sendRes.bind(res), sendError.bind(res));
});

api.get('/products/:productId', function(req, res) {
  billing.products
    .findById(req.params.productId)
    .then(sendRes.bind(res), sendError.bind(res));
});

api.put('/products/:productId', function(req, res) {
  if (req.body._id != req.params.productId) {
    return res.send(400); // TODO: send error type/code
  }

  billing.products
    .update(req.body)
    .then(sendSuccess.bind(res), sendError.bind(res));
});

api.get('/subscribers', function(req, res) {
  billing.subscribers
    .findAll()
    .then(sendRes.bind(res), sendError.bind(res));
});

api.post('/subscribers', function(req, res) {
  billing.subscribers
    .create(req.body)
    .then(sendRes.bind(res), sendError.bind(res));
});

api.get('/subscribers/:subscriberAlias', function(req, res) {
  billing.subscribers
    .findByAlias(req.params.subscriberAlias)
    .then(sendRes.bind(res), sendError.bind(res));
});

api.put('/subscribers/:subscriberAlias', function(req, res) {
  model.Subscriber.findOne({accountAlias: req.params.subscriberAlias}).exec()
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

api.del('/subscribers/:subscriberAlias', function(req, res) {
  var p = new mongoose.Promise();
  model.Subscriber.remove({accountAlias: req.params.subscriberAlias}, function(err) {
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

api.post('/subscribers/:subscriberAlias/addCard', function(req, res) {
  billing.subscribers.addCard(req.params.subscriberAlias, req.query.token)
    .then(sendRes.bind(res), sendError.bind(res));
});

api.post('/subscribers/:subscriberAlias/addSubscription', function(req, res) {
  billing.subscribers.addSubscription(req.params.subscriberAlias, req.query.product, req.query.plan, req.query.startDate)
    .then(sendRes.bind(res), sendError.bind(res));
});

api.post('/subscribers/:subscriberAlias/subscriptions/:productAlias/seats/:seatAlias/change', function(req, res) {
  billing.subscribers.changeSeats(
    req.params.subscriberAlias,
    req.params.productAlias,
    req.params.seatAlias,
    parseInt(req.query.delta),
    req.query.memo
  ).then(sendRes.bind(res), sendError.bind(res));
});

api.post('/subscribers/:subscriberAlias/subscriptions/:productAlias/meters/:meterAlias/record', function(req, res) {
  billing.subscribers.recordMeterReading(
    req.params.subscriberAlias,
    req.params.productAlias,
    req.params.meterAlias,
    parseInt(req.query.value, 10),
    req.query.memo
  ).then(sendRes.bind(res), sendError.bind(res));
});

api.post('/subscribers/:subscriberAlias/closeStatement', function(req, res) {
  var closingDate = new Date(parseInt(req.query.closingDate, 10)).clearTime();

  billing
    .subscribers
    .closeStatement(req.params.subscriberAlias, closingDate)
    .then(sendRes.bind(res), sendError.bind(res));
});

module.exports = api;
