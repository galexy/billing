'use strict';

require('date-utils');

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var _        = require('lodash');

var UsageSchema = new Schema({
  subscription: {type: Schema.ObjectId, required: true},
  component: {type: Schema.ObjectId, required: true},
  kind: {type: String, required: true, enum: ['Seat', 'Metered']},
  timestamp: {type: Date, required: true, default: Date.now},
  name: {type: String, required: true},
  quantity: {type: Number, required: true},
  memo: String
}, {strict: true});

UsageSchema.statics.aggregate = function(subscriptionIds, startDate, endDate, callback) {
  var self = this;

  // query for the aggregated meter readings for each meter type
  self.collection.collection.aggregate(
    {
      $match: {
        subscription: {$in: subscriptionIds},
        timestamp: {$gte: startDate, $lt: endDate.clone().addDays(1)},
        kind: 'Metered'
      }
    },
    {$group: {_id: { subscription: '$subscription', component: '$component'}, total: {$sum: '$quantity'}}},
    {$project: {_id: 0, subscription: '$_id.subscription', component: '$_id.component', quantity: '$total'}},
    function(err, meteredUsages) {
      if (err) {
        return callback(err);
      }

      // query for the maximum # of seats for each seat from current period
      self.collection.collection.aggregate(
      {
        $match: {
          subscription: {$in: subscriptionIds},
          timestamp: {$gte: startDate, $lt: endDate.clone().addDays(1)},
          kind: 'Seat'
        }
      },
      {$group: {_id: { subscription: '$subscription', component: '$component'}, max: {$max: '$quantity'}}},
      {$project: {_id: 0, subscription: '$_id.subscription', component: '$_id.component', quantity: '$max'}},
      function(err, currentPeriodSeats) {
        if (err) {
          return callback(err);
        }

        // query for the last change in # of seats before the current period
        self.collection.collection.aggregate(
        {
          $match: {
            subscription: {$in: subscriptionIds},
            timestamp: {$lt: startDate},
            kind: 'Seat'
          }
        },
        {$sort: {timestamp: -1}},
        {$group: {_id: {subscription: '$subscription', component: '$component'}, quantity: {$first: '$quantity'}}},
        {$project: {_id: 0, subscription: '$_id.subscription', component: '$_id.component', quantity: '$quantity'}},
        function(err, prevSeats) {
          if (err) {
            return callback(err);
          }

          // merge current maximum and previously seen seats
          _.reduce(prevSeats, function(results, seat) {
            var currSeat = _(results).first({subscription: seat.subscription, component: seat.component}).first();
            if (currSeat) {
              if (currSeat.quantity < seat.quantity) {
                currSeat.quantity = seat.quantity;
              }
            } else {
              results.push(seat);
            }
          }, currentPeriodSeats);

          return callback(null, meteredUsages, currentPeriodSeats);
        })
      });
    });
}

module.exports = mongoose.model('Usage', UsageSchema);
