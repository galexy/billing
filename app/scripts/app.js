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
  .run(function($window) {
    $window.Stripe.setPublishableKey('pk_test_kN2L3DR9qFOegK9KRHmd9v0K'); // TODO: figure out how to not hardcode this
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/dashboard'
      })
      .when('/dashboard', {
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
      .when('/products/:productId/components/:componentId', {
        templateUrl: 'views/component.html',
        controller: 'ComponentCtrl'
      })
      .when('/products/:productId/plans/:planId/components/:componentId', {
        templateUrl: 'views/component.html',
        controller: 'ComponentCtrl'
      })
      .when('/subscribers', {
        templateUrl: 'views/subscribers.html',
        controller: 'SubscribersCtrl'
      })
      .when('/subscribers/new', {
        templateUrl: 'views/subscriber.html',
        controller: 'SubscriberCtrl'
      })
      .when('/subscribers/:subscriberAlias', {
        templateUrl: 'views/subscriber.html',
        controller: 'SubscriberCtrl'
      })
      .when('/subscribers/:subscriberAlias/subscriptions/:subscriptionId', {
        templateUrl: 'views/subscriptiondetail.html',
        controller: 'SubscriptionDetailCtrl'
      })
      .when('/subscribers/:subscriberAlias/statements/:statementId', {
        templateUrl: 'views/statement.html',
        controller: 'StatementCtrl'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
