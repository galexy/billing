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
})

SubscriptionSchema.methods.incrementQuantityUsage = function(usageInfo, callback) {
  var self = this;

  var seatComponent = _.find(self.product.components, {kind: 'Seat', name: usageInfo.name});

  // TODO: handle missing component

  Usage
    .find({subscription: self.id, component: seatComponent.id})
    .sort('timestamp', -1)
    .limit(1)
    .exec(function(err, usage) {
      if (err) {
        return callback(err);
      }

      var prevQuantity = usage[0] ? usage[0].quantity.valueOf() : 0;

      Usage.create({
        subscription: self.id,
        component: seatComponent.id,
        kind: 'Seat',
        name: usageInfo.name,
        quantity: prevQuantity + usageInfo.delta,
        memo: usageInfo.memo
      }, function(err, usage) {
        if (err) {
          return callback(err);
        }

        self.usages.push(usage);
        return callback(null, usage);
      });
    });
}

SubscriptionSchema.methods.recordMeteredUsage = function(usageInfo, callback) {
  var self = this;
  var meteredComponent = _.find(self.product.components, {kind: 'Metered', name: usageInfo.name});

  Usage.create({
    subscription: self.id,
    component: meteredComponent.id,
    kind: 'Metered',
    name: usageInfo.name,
    quantity: usageInfo.quantity
  }, function(err, usage) {
    if (err) {
      return callback(err);
    }

    self.usages.push(usage);
    return callback(null, usage);
  });
}

module.exports = SubscriptionSchema;
