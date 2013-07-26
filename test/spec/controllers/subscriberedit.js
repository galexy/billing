'use strict';

describe('Controller: SubscribereditCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var SubscribereditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SubscribereditCtrl = $controller('SubscribereditCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
