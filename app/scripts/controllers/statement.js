'use strict';

angular.module('billingApp')
  .controller('StatementCtrl', function ($scope, $routeParams, Subscriber) {
    /*
     * Model
     */
    $scope.subscriber = Subscriber.get({subscriberAlias: $routeParams.subscriberAlias}, function(subscriber) {
      $scope.statement = _.find(subscriber.statements, {_id: $routeParams.statementId});
    }, function(err) {
      console.log(err);
    });
});
