'use strict';

var util     = require('util');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _        = require('lodash');
var Usage    = require('./usage');

var ChargeSchema = new Schema({
  timestamp: {type: Date, required: true, default: Date.now},
  kind: {type: String, required: true},
  detail: {type: String, required: true},
  unit: Number,
  quantity: {type: Number, required: true},
  total: Number
});

var PaymentSchema = new Schema({
  timestamp: {type: Date, required: true},
  success: {type: Boolean, required: true},
  kind: {type: String, required: true, enum: ['Credit Card']},
  message: {type: String, required: true},
  amount: {type: Number, required: true},
  stripeChargeId: String
});

var StatementSchema = new Schema({
  subscriber: {type: Schema.ObjectId, ref: 'Subscriber'},
  startDate: {type: Date, required: true},
  endDate: {type: Date, default:null},
  status: {type: String, required: true, enum: ['Open', 'Closing', 'Charged', 'Closed']},
  paid: {type: Boolean, required: true, default: false},
  openingBalance: {type: Number, required: true},
  balanceDue: Number,
  charges: [ChargeSchema],
  payments: [PaymentSchema]
}, {strict: true});

StatementSchema.methods.collateCharges = function(subscriber, callback) {
  var self = this;
  var subscriptionIds = _(subscriber.subscriptions).pluck('id').map(ObjectID).value();

  Usage.aggregate(subscriptionIds, self.startDate, self.endDate.clone().addDays(1), function(err, meteredUsages, seats) {
    if (err) {
      return callback(err);
    }

    var charges = _(subscriber.subscriptions)
      .map(function(subscription) {
        var plan = _.find(subscription.product.plans, {name: subscription.plan});

        return [
          // Charge for the plan
          {
            kind: 'Recurring',
            detail: util.format('%s - %s (%s - %s)', subscription.product.name, subscription.plan, self.startDate.toFormat('MM/DD/YYYY'), self.endDate.toFormat('MM/DD/YYYY')),
            unit: plan.unitcost,
            quantity: 1
          },

          // Charge for the seats
          _(seats)
            .where({subscription: subscription._id})
            .map(function(seat) {
              var component = subscription.product.components.id(seat.component);
              var unitcost = component.computeUnitCost(seat.quantity);

              return {
                kind: 'Seat',
                detail: component.name,
                unit: unitcost,
                quantity: seat.quantity
              }
            })
            .value(),

          // Charge for the metered components
          _(meteredUsages)
            .where({subscription: subscription._id})
            .map(function(meter) {
              var component = subscription.product.components.id(meter.component);
              var unitcost = component.computeUnitCost(meter.quantity);

              return {
                kind: 'Metered',
                detail: component.name,
                unit: unitcost,
                quantity: meter.quantity
              }
            })
            .value()
        ]
      })
      .flatten()
      .value();

    return callback(null, charges);
  });
}

StatementSchema.methods.prepareClose = function(closingDate, subscriber, callback) {
  // TODO: handle the case where statement is not open

  var self = this;

  self.endDate = closingDate;
  self.status = 'Closing';
  self.collateCharges(subscriber, function(err, charges) {
    self.charges = charges;
    self.balanceDue = self.openingBalance + self.totalCharge();
    self.save(callback);
  });
}

StatementSchema.methods.totalCharge = function() {
  return _.reduce(this.charges, function(total, charge) {
    return total += charge.unit * charge.quantity;
  }, 0);
}

StatementSchema.methods.close = function(callback) {
  this.status = 'Closed';
  this.save(callback);
}

module.exports = mongoose.model('Statement', StatementSchema);
