'use strict';

angular.module('billingApp')
  .filter('iif', function () {
    return function (predicate, trueValue, falseValue) {
      return predicate ? trueValue : falseValue;
    };
  });
