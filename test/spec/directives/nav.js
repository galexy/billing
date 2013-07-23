'use strict';

describe('Directive: nav', function () {
  beforeEach(module('billingApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<nav></nav>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the nav directive');
  }));
});
