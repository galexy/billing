'use strict';

angular.module('billingApp')
  .controller('SubscriberCtrl', function ($scope, $routeParams, $window, Subscriber) {
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
    }
  });
