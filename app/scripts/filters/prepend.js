'use strict';

angular.module('billingApp')
  .filter('prepend', function () {
    return function (input, prefix) {
      return null == input ? '' : prefix + input;
    };
  });
