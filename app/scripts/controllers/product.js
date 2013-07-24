'use strict';

angular.module('billingApp')
  .controller('ProductCtrl', function ($scope, $routeParams, $location, Product) {
    /*
     * Models
     */
    $scope.product = Product.get($routeParams); // Handle error?

    /*
     * Event Handlers
     */
    $scope.addComponent = function() {
      $location.path('/products/' + $routeParams.productId + '/components/new');
    };

    $scope.addPlan = function() {
      $location.path('/products/' + $routeParams.productId + '/plans/new');
    };
  });
