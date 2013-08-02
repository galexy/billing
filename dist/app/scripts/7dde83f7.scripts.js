'use strict';
angular.module('billingApp', [
  'ngResource',
  'ui.bootstrap'
]).config([
  '$httpProvider',
  function ($httpProvider) {
    var logsOutUserOn401 = function ($location, $q, Session) {
      var success = function (response) {
        return response;
      };
      var error = function (response) {
        if (response.status === 401) {
          Session.unset('user');
          $location.path('/login');
          return $q.reject(response);
        } else {
          return $q.reject(response);
        }
      };
      return function (promise) {
        return promise.then(success, error);
      };
    };
    $httpProvider.responseInterceptors.push(logsOutUserOn401);
  }
]).run([
  '$rootScope',
  '$location',
  'AuthenticationService',
  function ($rootScope, $location, AuthenticationService) {
    $rootScope.logout = function () {
      var logout = AuthenticationService.logout();
      logout.then(function () {
        $location.path('/login');
      });
      return logout;
    };
  }
]).run([
  '$rootScope',
  '$location',
  'AuthenticationService',
  function ($rootScope, $location, AuthenticationService) {
    var publicRoutes = ['/login'];
    $rootScope.$on('$routeChangeStart', function () {
      if (publicRoutes.indexOf($location.path()) === -1) {
        AuthenticationService.user();
      }
    });
  }
]).run([
  '$window',
  function ($window) {
    $window.Stripe.setPublishableKey('pk_live_Qft1frp8pcba3IYnb8Dhk2Ee');
  }
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', { redirectTo: '/dashboard' }).when('/dashboard', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    }).when('/products', {
      templateUrl: 'views/products.html',
      controller: 'ProductsCtrl'
    }).when('/products/:productId', {
      templateUrl: 'views/product.html',
      controller: 'ProductCtrl'
    }).when('/products/:productId/plans/:planId', {
      templateUrl: 'views/plan.html',
      controller: 'PlanCtrl'
    }).when('/products/:productId/components/:componentId', {
      templateUrl: 'views/component.html',
      controller: 'ComponentCtrl'
    }).when('/products/:productId/plans/:planId/components/:componentId', {
      templateUrl: 'views/component.html',
      controller: 'ComponentCtrl'
    }).when('/subscribers', {
      templateUrl: 'views/subscribers.html',
      controller: 'SubscribersCtrl'
    }).when('/subscribers/new', {
      templateUrl: 'views/subscriber.html',
      controller: 'SubscriberCtrl'
    }).when('/subscribers/:subscriberAlias', {
      templateUrl: 'views/subscriber.html',
      controller: 'SubscriberCtrl'
    }).when('/subscribers/:subscriberAlias/subscriptions/:subscriptionId', {
      templateUrl: 'views/subscriptiondetail.html',
      controller: 'SubscriptionDetailCtrl'
    }).when('/subscribers/:subscriberAlias/statements/:statementId', {
      templateUrl: 'views/statement.html',
      controller: 'StatementCtrl'
    }).otherwise({ redirectTo: '/login' });
  }
]);
'use strict';
angular.module('billingApp').controller('MainCtrl', [
  '$scope',
  function ($scope) {
    $scope.foo = 'foobar';
    $scope.bar = 'barbaz';
  }
]);