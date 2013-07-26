'use strict';

describe('Controller: SubscriberCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var SubscriberCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SubscriberCtrl = $controller('SubscriberCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
