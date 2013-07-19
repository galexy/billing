'use strict';

angular.module('billingApp')
  .service('AuthenticationService', function AuthenticationService($http, $timeout, $q, Session, Flash) {
    this.login = function(credentials) {
      var login = $http.post('/login', credentials);
      login.success(function(user) {
        Session.set('user', user);
        Flash.clear();
      }).error(function(error) {
        error = error.error ? error.error : error;
        Flash.show(error.message || error);
      });
      return login;
    };

    this.logout = function() {
      var logout = $http.get('/logout');
      logout.success(function() {
        Session.clear();
      });
      return logout;
    };

    this.user = function() {
      var user = Session.get('user');
      if (user) {
        var deferred = $q.defer();
        $timeout(function() {
          deferred.resolve(user);
        }, 0);
        return deferred.promise;
      } else {
        return $http.get('/user');
      }
    };
  });
