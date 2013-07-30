'use strict';

angular.module('billingApp')
  .controller('PlanCtrl', function ($scope, $rootScope, $routeParams, $location, $window, $dialog, Product) {
    /*
     * Model Data
     */
    $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
      // it sucks that I can't use a promise or a watch(w/o deep) to properly define this dependency
      if ($routeParams.planId === 'new') {
        $scope.plan = {};
        $scope.product.plans.push($scope.plan);
      } else {
        $scope.plan = _.find($scope.product.plans, {_id: $routeParams.planId});
      }
    });

    $scope.$watch('product.components', function() {
      $rootScope.availableComponents = _.reject($scope.product.components, function(component) {
        return _.any($scope.plan.components || [], {name: component.name});
      });
    });

    /*
     * Event handlers
     */
    $scope.addComponent = function() {
      var d = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        dialogFade: true,
        templateUrl: 'views/componentdialog.html',
        controller: 'ComponentDialogCtrl'
      });

      d.open().then(function(result) {
        var override = _.omit(result, '_id', 'pricing');
        override.pricing = _.map(result.pricing, function(tier) {
          return _.omit(tier, '_id');
        });

        $scope.plan.components = $scope.plan.components || [];
        $scope.plan.components.push(override);
      });
    };

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
      $scope.product.$save(function() {
        $location.path('/products/' + $routeParams.productId);
      }, function() {
        // TODO: handle error
      });
    };
  });
