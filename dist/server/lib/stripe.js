'use strict';

var util    = require('util');
var when    = require('when');
var request = require('superagent');

function StripeError(message, status, error, constr) {
  Error.captureStackTrace(this, constr || this);

  this.message = message || 'Stripe Error';
  if (status != null) this.status = status;
  if (error != null) this.error = error;
}

function ApiError(message, status, error) {
  ApiError.super_.call(this, message, status, error, this.constructor);
}

function InvalidRequestError(message, status, error) {
  InvalidRequestError.super_.call(this, message, status, error, this.constructor);
}

function CardError(message, status, error) {
  CardError.super_.call(this, message, status, error, this.constructor);
}

util.inherits(StripeError, Error);
util.inherits(ApiError, StripeError);
util.inherits(InvalidRequestError, StripeError);
util.inherits(CardError, StripeError);

module.exports = {
  StripeError: StripeError,
  ApiError: ApiError,
  InvalidRequestError: InvalidRequestError,
  CardError: CardError,

  client: function(apiKey, timeout) {
    var endpoint = 'https://api.stripe.com';
    timeout = timeout || 30 * 1000;

    function fail(res) {
      var error = res.body.error;

      if (error.type === 'invalid_request_error') {
        return new InvalidRequestError(error.message, res.status, error);
      } else if (error.type === 'api_error') {
        return new ApiError(error.message, res.status, error);
      } else if (error.type === 'card_error') {
        return new CardError(error.message, res.status, error);
      } else {
        return new StripeError(error.message || 'Error executing stripe request', res.status);
      }
    }

    function post(url, data) {
      var d = when.defer();
      request
        .post(endpoint + url)
        .redirects(0)
        .auth(apiKey, '')
        .set('Accept', 'application/json')
        .type('form')
        .send(data)
        .timeout(timeout)
        .end(function(err, res) {
          if (err) {
            return d.reject(err);
          }

          if (res.error) {
            return d.reject(fail(res));
          }

          return d.resolve(res.body);
        });
      return d.promise;
    }

    return {
      customers: {
        create: function(customer) {
          return post('/v1/customers', customer);
        },

        update: function(customerId, changes) {
          return post('/v1/customers/' + customerId, changes);
        }
      },

      charges: {
        create: function(charge) {
          return post('/v1/charges', charge);
        }
      }
    };
  }
};
