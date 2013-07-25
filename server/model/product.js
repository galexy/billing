'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// TODO: move to configuration
var conn = mongoose.createConnection('mongodb://localhost/billing');

var PricingTierSchema = new Schema({
  start: {type: Number, required: true},
  end: {type: Number},
  unitcost: {type: Number, required: true}
}, {strict: true});

var ComponentSchema = new Schema({
  name: {type: String, required: true},
  active: {type: Boolean, required: true, default: true},
  kind: {type: String, enum: ['Seat', 'Metered']},
  pricing: [PricingTierSchema]
}, {strict: true});

ComponentSchema.methods.computeUnitCost = function(quantity) {
  var tier = _(this.pricing)
    .sortBy('start')
    .where(function(price) {
      return price.start <= quantity;
    })
    .first();

  return tier.unitcost;
};

var PlanSchema = new Schema({
  name: {type: String, required: true},
  alias: {type: String, required: true},
  description: String,
  unitcost: {type: Number, required: true, min: 0},
  components: [ComponentSchema]
}, {strict: true});

var ProductSchema = new Schema({
  name: {type: String, required: true},
  plans: [PlanSchema],
  components: [ComponentSchema]
}, {strict: true});

module.exports = conn.model('Product', ProductSchema);
