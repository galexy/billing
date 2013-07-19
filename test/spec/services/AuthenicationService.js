'use strict';

describe('Service: AuthenicationService', function () {

  // load the service's module
  beforeEach(module('billingApp'));

  // instantiate service
  var AuthenicationService;
  beforeEach(inject(function (_AuthenicationService_) {
    AuthenicationService = _AuthenicationService_;
  }));

  it('should do something', function () {
    expect(!!AuthenicationService).toBe(true);
  });

});
