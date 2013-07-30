'use strict';

angular.module('billingApp')
  .factory('Subscriber', function Subscriber($resource) {
    return $resource('/api/subscribers/:subscriberId/:card',
      {subscriberId: '@_id'},
      {
        save: {method: 'PUT'},
        create: {method: 'POST'},
        addCard: {method: 'POST', params:{card:'addCard'}}
      });
  });
