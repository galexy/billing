'use strict';

describe('Controller: CreditcarddialogCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var CreditcarddialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreditcarddialogCtrl = $controller('CreditcarddialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
