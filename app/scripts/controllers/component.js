'use strict';

angular.module('billingApp')
  .controller('ComponentCtrl', function ($scope, $routeParams, $location, $window, Product) {
    $scope.componentKinds = ['Metered', 'Seat'];

    $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
      $scope.component = _.find(product.components, {_id: $routeParams.componentId});
    });

    $scope.addTier = function() {
      $scope.component.pricing.push({});
    }
  });
