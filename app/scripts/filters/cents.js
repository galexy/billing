'use strict';

angular.module('billingApp')
  .filter('cents', function ($filter) {
    return function (input) {
      return $filter('currency')(input/100, '$');
    };
  });
