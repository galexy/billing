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
  startDate: {type: Date, required: true, default: Date.today},
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

SubscriberSchema.index({accountAlias: 1}, {unique: true});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
