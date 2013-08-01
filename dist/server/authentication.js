'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('./model').User;

module.exports = {
  localStrategy: new LocalStrategy(
    function(username, password, done) {
      User
        .findByUsername(username)
        .then(function(user) {
          if(!user) {
            return done(null, false, { message: 'Incorrect username.' });
          } else if(user.password != password) {
            return done(null, false, { message: 'Incorrect password.' });
          } else {
            return done(null, user);
          }
        });
    }
  ),

  basicStrategy: new BasicStrategy(
    function(username, password, done) {
      User
        .findApiKeyByName(username)
        .then(function(user) {
          if (!user) {
            done(null, false, { message: 'Invalid API Key.'});
          } else {
            done(null, user);
          }
        });
    }
  ),

  serializeUser: function(user, done) {
    done(null, user.id);
  },

  deserializeUser: function(id, done) {
    User
      .findById(id)
      .then(function(user) {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
  },

  login: function(req, res, next) {
    return passport.authenticate('local', function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(400, {message: 'Bad username or password'});
      }

      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }

        res.json(200, user);
      });
    })(req, res, next);
  },

  logout: function(req, res) {
    req.logout();
    return res.send(200);
  },

  // NOTE: Need to protect all API calls (other than login/logout) with this check
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.send(401);
    }
  },

  authenticateApi: (function() {
    return passport.authenticate('basic', {session: false});
  })(),

  csrf: function(req) {
    var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
    return token;
  }
};
