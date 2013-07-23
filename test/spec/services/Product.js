'use strict';

describe('Service: Plan', function () {

  // load the service's module
  beforeEach(module('billingApp'));

  // instantiate service
  var Plan;
  beforeEach(inject(function (_Plan_) {
    Plan = _Plan_;
  }));

  it('should do something', function () {
    expect(!!Plan).toBe(true);
  });

});
