'use strict';

require('date-utils');

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _        = require('lodash');
var Activity = require('./activity');
var Usage    = require('./usage');

var SubscriptionSchema = new Schema({
  product: {type: Schema.ObjectId, ref: 'Product'},
  plan: {type: String, required: true},
  startDate: {type: Date, required: true, default: Date.now},
  endDate: {type: Date, default: null},
  status: {type: String, required: true, default: 'Active'},
  usages: [{type: Schema.Types.ObjectId, ref: 'Usage'}],
  activities: [Activity]
}, {strict: true});

module.exports = SubscriptionSchema;
