'use strict';

angular.module('billingApp')
  .directive('nav', function ($location) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$on('$routeChangeSuccess', function(e, current, previous) {
          var path = '#' + $location.path();

          $(element).find('li').removeClass('active');
          $(element).find('li a').filter(function() {
            return 0 === path.indexOf($(this).attr('href'));
          }).first().parent().addClass('active');
        });
      }
    };
  });
