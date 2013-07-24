'use strict';

angular.module('billingApp')
  .directive('money', function ($filter) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function postLink(scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }

        ngModel.$formatters.push(function(value) {
          return value / 100.0;
        });

        ngModel.$parsers.push(function(value) {
          return value * 100.0;
        });
      }
    };
  });
