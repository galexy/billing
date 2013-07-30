'use strict';

describe('Controller: SubscriptiondetailCtrl', function () {

  // load the controller's module
  beforeEach(module('billingApp'));

  var SubscriptiondetailCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SubscriptiondetailCtrl = $controller('SubscriptiondetailCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
