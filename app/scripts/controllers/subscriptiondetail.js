'use strict';

angular.module('billingApp')
  .controller('SubscriptionDetailCtrl', function ($scope, $routeParams, Subscriber) {
    /*
     * Model
     */
    $scope.subscriber = Subscriber.get({subscriberAlias: $routeParams.subscriberAlias}, function(subscriber) {
      $scope.subscription = _.find(subscriber.subscriptions, {_id: $routeParams.subscriptionId});
    }, function(err) {
      console.log(err);
      // TODO: handle error
    });

  });
