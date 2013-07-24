'use strict';

angular.module('billingApp')
  .controller('ProductCtrl', function ($scope, $routeParams, Product) {
    $scope.product = Product.get($routeParams); // Handle error?
  });
