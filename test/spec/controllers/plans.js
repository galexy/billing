'use strict';

describe('Controller: PlansCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var PlansCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PlansCtrl = $controller('PlansCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
