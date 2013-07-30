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
      var $form = $('#creditCardForm');       // BAD BAD BAD
      $window.Stripe.createToken($form, function(status, response) {
        if (response.error) {
          console.log(response.error);
        }

        dialog.close(response.id);
      });
    };
  });
