'use strict';

angular.module('billingApp')
  .controller('SubscriberCtrl', function ($scope, $routeParams, $window, $dialog, Subscriber) {
    /*
     * Model
     */
    $scope.isNew = angular.isUndefined($routeParams.subscriberAlias);

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

      d.open().then(function(subscription) {
        $scope.subscriber.$addSubscription({
          product: subscription.product.alias,
          plan: subscription.plan.alias,
          startDate: subscription.startDate
        }, function() {
          console.log('looky');
        }, function(err) {
          console.log(err);
        });
      });
    };

    $scope.closeStatement = function() {
      $scope.subscriber.$closeStatement({
        closingDate: (new Date()).valueOf()
      }, function() {
        console.log('look ma, no hands');
      }, function(err) {
        console.log(err);
      });
    };
  });
