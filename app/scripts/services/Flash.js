'use strict';

angular.module('billingApp')
  .service('Flash', function Flash($rootScope) {
    this.show = function(message) {
      $rootScope.flash = message;
    };

    this.clear = function() {
      $rootScope.flash = '';
    };
  });
