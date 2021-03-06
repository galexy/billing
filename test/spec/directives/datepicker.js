'use strict';

describe('Directive: datepicker', function () {
  beforeEach(module('billingApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<datepicker></datepicker>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the datepicker directive');
  }));
});
