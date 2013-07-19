'use strict';

angular.module('billingApp')
  .service('Session', function Session() {
    this.get = function(key) {
      return sessionStorage.getItem(key);
    };

    this.set = function(key, value) {
      return sessionStorage.setItem(key, value);
    };

    this.unset = function(key) {
      return sessionStorage.removeItem(key);
    };

    this.clear = function() {
      return sessionStorage.clear();
    };
  });
