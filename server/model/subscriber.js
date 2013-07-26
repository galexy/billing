'use strict';

require('date-utils');

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var _            = require('lodash');
var Activity     = require('./activity');
var Subscription = require('./subscription');
var Statement    = require('./statement');
var Product      = require('./product');

function beginningThisMonth() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDay());
}

function beginningNextMonth() {
  return beginningThisMonth().clone().addMonths(1);
}

var SubscriberSchema = new Schema({
  accountName: {type: String, required: true},
  accountAlias: {type: String, required: true, unique: true},
  email: {type: String, required: true},
  contactFirstName: {type: String, required: true},
  contactLastName: {type: String, required: true},
  status: {type: String, required: true},
  subscriptions: [Subscription],
  nextProcessingDate: {type: Date, required: true, default: beginningNextMonth},
  stripeCustomerId: String,
  activeCard: {
    exp_month: Number,
    exp_year: Number,
    fingerprint: String,
    last4: String,
    type: {type: String},
    name: String
  },
  statements: [{type: Schema.Types.ObjectId, ref: 'Statement'}]
}, {strict: true});

SubscriberSchema.statics.findOrCreate = function(subscriber, callback) {
  var self = this;
  self.findOne({accountAlias: subscriber.accountAlias}, function(err, existingSubscriber) {
    if (err || existingSubscriber) {
      return callback(err, existingSubscriber);
    }

    if (!existingSubscriber) {
      var newSubscriber = _.assign(_.pick(subscriber, 'accountName', 'accountAlias', 'email', 'contactFirstName', 'contactLastName', 'nextProcessingDate'), {status: 'Active'});

      self.create(newSubscriber, callback);
    }
  });
};

SubscriberSchema.methods.addSubscription = function(subscription, callback) {
  var self = this;

  Product.findOne({name: subscription.product.name}, function(err, product) {
    if (err) {
      return callback(err);
    }

    // TODO: handle missing product
    // TODO: handle missing plan

    self.subscriptions.push({
      product: product,
      plan: subscription.product.plan,
      startDate: Date.today(),
      status: 'Active',
      activities: [{type: Activity.types.signedup, params: {product: product.name}}]
    });

    self.save(callback);
  });
};

SubscriberSchema.methods.currentStatement = function(callback) {
  var lastStatementId = _.last(this.statements);
  Statement.findById(lastStatementId, callback);
};

module.exports = mongoose.model('Subscriber', SubscriberSchema);
