'use strict';

angular.module('billingApp')
  .factory('Subscriber', function Subscriber($resource) {
    return $resource('/api/subscribers/:subscriberId/:cmd',
      {subscriberId: '@_id'},
      {
        save: {method: 'PUT'},
        create: {method: 'POST'},
        addCard: {method: 'POST', params:{cmd:'addCard'}},
        addSubscription: {method: 'POST', params:{cmd:'addSubscription'}}
      });
  });
