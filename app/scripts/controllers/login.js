'use strict';

angular.module('billingApp')
  .controller('LoginCtrl', function ($scope, $location, AuthenticationService) {
    $scope.sampleUsers = [
      {
        username: 'admin',
        password: 'pass'
      },
      {
        username: 'user',
        password: 'pass'
      }
    ];

    $scope.login = function() {
      AuthenticationService.login(this.credentials).success(function() {
        $location.path('/'); // TODO: should route back to original path
      });
    };
  });
