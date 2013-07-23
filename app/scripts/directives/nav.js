'use strict';

angular.module('billingApp')
  .directive('nav', function ($location) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$on('$routeChangeSuccess', function(e, current, previous) {
          var anchor = 'li > a[href="#' + $location.path() + '"]';

          $(element).find('li').removeClass('active');
          $(element).find(anchor).parent().addClass('active');
        })
      }
    };
  });
