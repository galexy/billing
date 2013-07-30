'use strict';

angular.module('billingApp')
  .factory('Product', function Product($resource) {
    return $resource('/ajax/products/:productId',
      {productId: '@_id'},
      {save: {method: 'PUT'}});
  });
