'use strict';

describe('Service: Flash', function () {

  // load the service's module
  beforeEach(module('billingApp'));

  // instantiate service
  var Flash;
  beforeEach(inject(function (_Flash_) {
    Flash = _Flash_;
  }));

  it('should do something', function () {
    expect(!!Flash).toBe(true);
  });

});
