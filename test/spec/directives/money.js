'use strict';

describe('Directive: money', function () {
  beforeEach(module('billingApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<money></money>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the money directive');
  }));
});
