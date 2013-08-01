'use strict';

var mongoose = require('mongoose');
var when     = require('when');
var nodefn   = require('when/node/function');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true}
}, {strict: true});

var User = mongoose.model('User', UserSchema);

function promise(f) {
  var d = when.defer();
  f(nodefn.createCallback(d.resolver));
  return d.promise;
}

module.exports = {
  findById: function(id) {
    return promise(function(r) {
      User.findById(id, r);
    });
  },

  findByUsername: function(username) {
    return promise(function(r) {
      User.findOne({username: username, role: 'User'}, r);
    });
  },

  findApiKeyByName: function(username) {
    return promise(function(r) {
      User.findOne({username: username, role:'API'}, r);
    });
  }
};
