'use strict';

angular.module('billingApp')
  .controller('ProductsCtrl', function ($scope, Product) {
    $scope.products = Product.query();
  });
