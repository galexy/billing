'use strict';

angular.module('billingApp')
  .controller('ProductsCtrl', function ($scope, Product) {
    /*
     * Models
     */
    $scope.products = Product.query();
  });
