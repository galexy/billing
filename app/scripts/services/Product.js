'use strict';

angular.module('billingApp')
  .factory('Product', function Product($resource, $q) {
    var ProductResource = $resource('/api/products/:productId', {productId: '@_id'});

    return {
      get: function get(filter) {
        var delay = $q.defer();
        ProductResource.get(filter, function(product) {
          delay.resolve(product);
        }, function() {
          delay.reject('Epic Fail');
        });

        return delay.promise;
      },

      query: function query() {
        var delay = $q.defer();
        ProductResource.query(function(products) {
          delay.resolve(products);
        }, function() {
          delay.reject('Epic Fail');
        });

        return delay.promise;
      }
    };
  });
