'use strict';

angular.module('billingApp')
  .directive('dateinput', function ($filter) {
    function isoDateFormat(d){
      function pad(n) {
        return n<10 ? '0'+n : n;
      }

      return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth()+1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds()) + 'Z';
    }

    return {
      restrict: 'A',
      require: '?ngModel',
      link: function postLink(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(value) {
          return isoDateFormat(new Date(value));
        });

        ngModel.$formatters.push(function(value) {
          return $filter('date')(value, 'MM/dd/yyyy');
        });

        $(element).datepicker({
          format: 'mm/dd/yyyy'
        })
        .on('changeDate', function(ev) {
          scope.$apply(function() {
            ngModel.$setViewValue(element.val());
          });
          $(element).datepicker('hide');
        });
      }
    };
  });
