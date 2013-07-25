'use strict';

angular.module('billingApp')
  .controller('ComponentCtrl', function ($scope, $routeParams, $location, $window, Product) {
    /*
     * Selection choices
     */
    $scope.componentKinds = ['Metered', 'Seat'];

    /*
     * Models
     */
    $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
      var components = angular.isUndefined($routeParams.planId)
        ? product.components
        : _.find(product.plans, {_id: $routeParams.planId}).components;

      if ($routeParams.componentId === 'new') {
        $scope.component = { pricing: [] };
        components.push($scope.component);
      } else {
        $scope.component = _.find(components, {_id: $routeParams.componentId});
      }
    });

    /*
     * Event handlers
     */
    $scope.addTier = function() {
      $scope.component.pricing.push({});
    };

    $scope.removeTier = function(index) {
      $scope.component.pricing.splice(index, 1);
    };

    $scope.save = function() {
      $scope.product.$save(function() {
        $window.history.back();
      }, function() {
        // TODO: come up with a way to handle errors?
      });
    };

    $scope.cancel = function() {
      $window.history.back();
    };

    $scope.deleteComponent = function() {
      $scope.product.components = _.without($scope.product.components, $scope.component);
      $scope.save();
    };
  });
