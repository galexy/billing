'use strict';

describe('Filter: cents', function () {

  // load the filter's module
  beforeEach(module('billingApp'));

  // initialize a new instance of the filter before each test
  var cents;
  beforeEach(inject(function ($filter) {
    cents = $filter('cents');
  }));

  it('should return the input prefixed with "cents filter:"', function () {
    var text = 'angularjs';
    expect(cents(text)).toBe('cents filter: ' + text);
  });

});
