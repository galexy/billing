'use strict';

describe('Filter: yesno', function () {

  // load the filter's module
  beforeEach(module('billingApp'));

  // initialize a new instance of the filter before each test
  var yesno;
  beforeEach(inject(function ($filter) {
    yesno = $filter('yesno');
  }));

  it('should return the input prefixed with "yesno filter:"', function () {
    var text = 'angularjs';
    expect(yesno(text)).toBe('yesno filter: ' + text);
  });

});
