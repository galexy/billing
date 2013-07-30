'use strict';

describe('Controller: SubscriptiondialogCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var SubscriptiondialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SubscriptiondialogCtrl = $controller('SubscriptiondialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
