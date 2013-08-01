'use strict';

var mongoose = require('mongoose');

var mongourl = process.env.MONGODBURL || 'mongodb://localhost/billing';
console.log('Database url: ', mongourl);
mongoose.connect(mongourl, {
  db: {native_parser: true}
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('connecting', console.log.bind(console, 'connecting to database:'));
db.on('connected', console.log.bind(console, 'connected to database:'));
db.on('disconnecting', console.log.bind(console, 'disconnecting from database:'));
db.on('disconnected', console.log.bind(console, 'disconnected from database:'));
db.on('close', console.log.bind(console, 'connection to database closed:'));
db.on('reconnected', console.log.bind(console, 'reconnected to database:'));
db.on('error', console.log.bind(console, 'database error:'));
db.once('open', console.log.bind(console, 'opened database:'));

module.exports.Product      = require('./product');
module.exports.User         = require('./user');
module.exports.Statement    = require('./statement');
module.exports.Subscriber   = require('./subscriber');
module.exports.Subscription = require('./subscription');
module.exports.Usage        = require('./usage');
module.exports.Activity     = require('./activity');
