'use strict';

angular.module('billingApp')
  .controller('SubscribersCtrl', function ($scope, Subscriber) {
    /*
     * Model
     */
    $scope.subscribers = Subscriber.query();
  });
