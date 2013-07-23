'use strict';

angular.module('billingApp')
  .controller('ProductsCtrl', function ($scope, $q, Product) {
    $scope.products = Product.query();
  });
