'use strict';

angular.module('billingApp')
  .controller('PlanCtrl', function ($scope, $routeParams, $location, $window, Product) {
    /*
     * Model Data
     */
    $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
      if ($routeParams.planId === 'new') {
        $scope.plan = {};
        $scope.product.plans.push($scope.plan);
      } else {
        // it sucks that I can't use a promise or a watch to properly define this dependency
        $scope.plan = _.find($scope.product.plans, {_id: $routeParams.planId});
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

    $scope.deletePlan = function deletePlan() {
      $scope.product.plans = _.without($scope.product.plans, $scope.plan);
      $scope.save();
    };
  });
