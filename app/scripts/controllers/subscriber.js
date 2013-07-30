'use strict';

angular.module('billingApp')
  .controller('SubscriberCtrl', function ($scope, $routeParams, $window, $dialog, Subscriber) {
    /*
     * Model
     */
    $scope.isNew = angular.isUndefined($routeParams.subscriberId);

    $scope.subscriber = $scope.isNew ? {} : Subscriber.get($routeParams);

    /*
     * Event handlers
     */
    $scope.save = function() {
      var updater = ($scope.isNew) ? Subscriber.create.bind(Subscriber, {})
                                   : $scope.subscriber.$save.bind($scope.subscriber);

      updater($scope.subscriber, function() {
        $window.history.back();
      }, function(err) {
        // TOOD: handle error
      });
    };

    $scope.cancel = function() {
      $window.history.back();
    };

    $scope.deleteSubscriber = function() {
      $scope.subscriber.$delete(function() {
        $window.history.back();
      });
    };

    $scope.addCreditCard = function() {
      var d = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        dialogFade: true,
        templateUrl: 'views/creditcarddialog.html',
        controller: 'CreditCardDialogCtrl'
      });

      d.open().then(function(token) {
        $scope.subscriber.$addCard({token: token}, function() {
          console.log('looky');
        }, function(err) {
          console.log(err);
        });
      });
    };

    $scope.addSubscription = function() {
      var d = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        dialogFade: true,
        templateUrl: 'views/subscriptiondialog.html',
        controller: 'SubscriptionDialogCtrl'
      });

      d.open().then(function(product) {
        $scope.subscriber.$addSubscription({
          product: product.product.alias,
          plan: product.plan.alias
        }, function() {
          console.log('looky');
        }, function(err) {
          console.log(err);
        });
      });
    };
  });
