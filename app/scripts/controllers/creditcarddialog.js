'use strict';

angular.module('billingApp')
  .controller('CreditCardDialogCtrl', function ($scope, $window, dialog) {
    /*
     * Event Handlers
     */
    $scope.cancel = function() {
      dialog.close();
    };

    $scope.addCard = function() {
      $window.Stripe.createToken({
        number: $scope.number,
        cvc: $scope.cvc,
        exp_month: $scope.exp_month,
        exp_year: $scope.exp_year,
        address_line1: $scope.address_line1,
        address_city: $scope.address_city,
        address_state: $scope.address_state,
        address_zip: $scope.address_zip,
      }, function(status, response) {
        if (response.error) {
          console.log(response.error);
        }

        dialog.close(response.id);
      });
    };
  });
