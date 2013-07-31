'use strict';

angular.module('billingApp')
  .filter('yesno', function () {
    return function (input) {
      return input ? 'Yes' : 'No';
    };
  });
