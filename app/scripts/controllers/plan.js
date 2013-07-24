'use strict';

angular.module('billingApp')
  .controller('PlanCtrl', function ($scope, $routeParams, $location, $window, Product) {
    /*
     * Model Data
     */
    $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
      // it sucks that I can't use a promise or a watch to properly define this dependency
      $scope.plan = _.find($scope.product.plans, {_id: $routeParams.planId});
    });

    /*
     * Watches
     */
    $scope.$watch('plan.unitcost', function() {
      if ($scope.plan) {
        $scope.unitcostInDollars = $scope.plan.unitcost / 100;
      }
    });

    $scope.$watch('unitcostInDollars', function() {
      if ($scope.plan) {
        $scope.plan.unitcost = $scope.unitcostInDollars * 100;
      }
    });

    /*
     * Event handlers
     */
    $scope.save = function save() {
      $scope.product.$save(function() {
        $location.path('/products/' + $routeParams.productId);
      }, function() {
        // TODO: come up with a way to handle errors?
      });
    };

    $scope.cancel = function cancel() {
      $window.history.back();
    };
  });
