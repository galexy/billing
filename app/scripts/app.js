'use strict';

angular.module('billingApp', ['ngResource', 'ui.bootstrap'])
  .config(function($httpProvider) {
    var logsOutUserOn401 = function($location, $q, Session) {
      var success = function(response) {
        return response;
      };

      var error = function(response) {
        if (response.status === 401) {
          Session.unset('user');
          $location.path('/login');
          return $q.reject(response);
        } else {
          return $q.reject(response);
        }
      };

      return function(promise) {
        return promise.then(success, error);
      };
    };

    $httpProvider.responseInterceptors.push(logsOutUserOn401);
  })
  .run(function($rootScope, $location, AuthenticationService) {
    $rootScope.logout = function () {
      var logout = AuthenticationService.logout();
      logout.then(function() {
        $location.path('/login');
      });
      return logout;
    };
  })
  .run(function($rootScope, $location, AuthenticationService) {
    var publicRoutes = ['/login'];

    $rootScope.$on('$routeChangeStart', function() {
      if (publicRoutes.indexOf($location.path()) === -1) {
        AuthenticationService.user(); // http responseInterceptor will redirect to /login if this call fails
      }
    });
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/products', {
        templateUrl: 'views/products.html',
        controller: 'ProductsCtrl'
      })
      .when('/products/:productId', {
        templateUrl: 'views/product.html',
        controller: 'ProductCtrl'
      })
      .when('/products/:productId/plans/:planId', {
        templateUrl: 'views/plan.html',
        controller: 'PlanCtrl'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
