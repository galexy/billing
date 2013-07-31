'use strict';

angular.module('billingApp')
  .factory('Subscriber', function Subscriber($resource) {
    return $resource('/ajax/subscribers/:subscriberAlias/:cmd',
      {subscriberAlias: '@accountAlias'},
      {
        save: {method: 'PUT'},
        create: {method: 'POST', params: {subscriberAlias:''}},
        addCard: {method: 'POST', params:{cmd:'addCard'}},
        addSubscription: {method: 'POST', params:{cmd:'addSubscription'}},
        closeStatement: {method: 'POST', params:{cmd:'closeStatement'}}
      });
  });
