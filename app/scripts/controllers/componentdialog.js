'use strict';

angular.module('billingApp')
  .controller('ComponentDialogCtrl', function ($scope, dialog) {
    $scope.close = function(result) {
      dialog.close(result);
    };
  });
