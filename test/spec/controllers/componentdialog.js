'use strict';

describe('Controller: ComponentdialogCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var ComponentdialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ComponentdialogCtrl = $controller('ComponentdialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
