'use strict';

describe('Filter: infinte', function () {

  // load the filter's module
  beforeEach(module('billingApp'));

  // initialize a new instance of the filter before each test
  var infinte;
  beforeEach(inject(function ($filter) {
    infinte = $filter('infinte');
  }));

  it('should return the input prefixed with "infinte filter:"', function () {
    var text = 'angularjs';
    expect(infinte(text)).toBe('infinte filter: ' + text);
  });

});
