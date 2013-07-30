'use strict';

describe('Filter: prepend', function () {

  // load the filter's module
  beforeEach(module('billingApp'));

  // initialize a new instance of the filter before each test
  var prepend;
  beforeEach(inject(function ($filter) {
    prepend = $filter('prepend');
  }));

  it('should return the input prefixed with "prepend filter:"', function () {
    var text = 'angularjs';
    expect(prepend(text)).toBe('prepend filter: ' + text);
  });

});
