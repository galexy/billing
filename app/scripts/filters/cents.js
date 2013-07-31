'use strict';

angular.module('billingApp')
  .filter('cents', function ($filter) {
    return function (input) {
      input = input || 0;
      return $filter('currency')(input/100, '$');
    };
  });
