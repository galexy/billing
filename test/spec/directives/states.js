'use strict';

describe('Directive: states', function () {
  beforeEach(module('billingApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<states></states>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the states directive');
  }));
});
