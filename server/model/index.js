'use strict';

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODBURL || 'mongodb://localhost/billing', {
  db: {native_parser: true}
});

module.exports.Product      = require('./product');
module.exports.User         = require('./user');
module.exports.Statement    = require('./statement');
module.exports.Subscriber   = require('./subscriber');
module.exports.Subscription = require('./subscription');
module.exports.Usage        = require('./usage');
module.exports.Activity     = require('./activity');
