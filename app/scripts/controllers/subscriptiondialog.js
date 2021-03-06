'use strict';

angular.module('billingApp')
  .controller('SubscriptionDialogCtrl', function ($scope, dialog, Product) {
    $scope.availableProducts = Product.query();

    $scope.cancel = function() {
      dialog.close();
    };

    $scope.addSubscription = function() {
      dialog.close(_.pick($scope, 'product', 'plan', 'startDate'));
    };
  });
