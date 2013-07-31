'use strict';

require('date-utils');

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Activity = new Schema({
  timestamp: {type: Date, required: true, default: Date.now},
  type: {type: Number, required: true},
  params: {type:Schema.Types.Mixed}
});

Activity.types = {
  signedup: 0,

  messages: [
    'Successfully signed up for {product}',
  ]
}

module.exports = Activity;