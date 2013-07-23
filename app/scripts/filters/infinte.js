'use strict';

angular.module('billingApp')
  .filter('infinte', function () {
    return function (input) {
      return angular.isNumber(input) ? input : '\u221E';
    };
  });
