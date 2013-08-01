'use strict';

var _            = require('lodash');
var util         = require('util');
var when         = require('when');
var nodefn       = require('when/node/function');
var model        = require('../model');
var stripe       = require('./stripe');
var stripeClient = stripe.client(process.env.STRIPE_APIKEY);
var ObjectID = require('mongodb').ObjectID;

function BillingError(message, error, constr) {
  Error.captureStackTrace(this, constr || this);

  this.message = message || '';
  if (error != null) {
    this.error = error;
  }
}

function InternalError(message, error) {
  InternalError.super_.call(this, message, error, this.constructor);
}

function InvalidRequestError(message, status, error) {
  InvalidRequestError.super_.call(this, message, error, this.constructor);
}

function NotFoundError(message, status, error) {
  NotFoundError.super_.call(this, message, error, this.constructor);
}

util.inherits(BillingError, Error);
util.inherits(InternalError, BillingError);
util.inherits(InvalidRequestError, BillingError);
util.inherits(NotFoundError, BillingError);

function promise(f) {
  var d = when.defer();
  f(nodefn.createCallback(d.resolver));
  return d.promise;
}

function checkNotFound(obj) {
  if (null == obj) {
    throw new NotFoundError();
  }
  return obj;
}

function findAllProducts() {
  return promise(function(r) {
    model.Product.find().lean(true).exec(r);
  });
}

function findProductById(id) {
  if (!/^([0-9a-f]){24}$/.test(id)) {
    return when.reject(new NotFoundError());
  }

  return promise(function(r) {
    model.Product.findById(id).lean(true).exec(r);
  })
  .then(checkNotFound);
}

// TODO: understand if _.assign destroys mongoose object and therefore preventing validation
function updateProduct(updatedProduct) {
  return promise(function(r) { 
    model.Product.findById(updatedProduct._id, r); 
  })
  .then(checkNotFound)
  .then(function(product) {
    return promise(function(r) {
      product = _.assign(product, updatedProduct);
      product.save(r);
    });
  });
}

function createStatementForSubscriber(subscriber) {
  return promise(function(r) {
    model.Statement.create({
      subscriber: subscriber._id,
      startDate: subscriber.startDate,
      openingBalance: 0,
      status: 'Open'
    }, r);
  })
  .then(function(statement) {
    return promise(function(r) {
      subscriber.statements.push(statement);
      subscriber.save(function(err, savedSubscriber) {
        r(err, savedSubscriber);
      });
    });
  });
}

function findAllSubscribers() {
  return promise(function(r) {
    model.Subscriber.find().lean(true).exec(r);
  });
}

function findSubscriberByAlias(alias) {
  return promise(function(r) {
    model.Subscriber
      .findOne({accountAlias: alias})
      .lean(true)
      .populate('statements subscriptions.product subscriptions.usages')
      .exec(r);
  })
  .then(checkNotFound);
}

function createSubscriber(newSubscriber) {
  var subscriber = null;

  return promise(function(r) {
    model.Subscriber.create(newSubscriber, r);
  })
  .then(function(savedSubscriber) {
    subscriber = savedSubscriber;
    return { email: subscriber.email };
  })
  .then(stripeClient.customers.create.bind(stripeClient.customers), function(err) {
    if (err instanceof stripe.StripeError && null != subscriber) {
      subscriber.remove();
    }
    throw err;
  })
  .then(function(stripeCustomer) {
    subscriber.stripeCustomerId = stripeCustomer.id;
    return promise(function(r) {
      subscriber.save(function(err, savedSubscriber) {
        r(err, savedSubscriber);
      });
    });
  })
  .then(createStatementForSubscriber);
}

function updateSubscriber(subscriberAlias, subscriberBody) {
  if (subscriberAlias != subscriberBody.accountAlias) {
    return when.reject(new InvalidRequestError('alias does not match'));
  }

  return promise(function(r) {
    model.Subscriber.findOne({accountAlias: subscriberAlias}, r);
  })
  .then(checkNotFound)
  .then(function(subscriber) {
    if (subscriber.id != subscriberBody._id) {
      throw new InvalidRequestError('_id is not correct');
    }

    _.assign(subscriber, _.pick(subscriberBody, 
      'accountName',
      'contactFirstName',
      'contactLastName',
      'email'));

    return promise(function(r) {
      subscriber.save(function(err, subscriber) {
        r(err, subscriber);
      });
    });
  });
}

function addCardForSubscriber(subscriberAlias, cardToken) {
  var subscriber = null;
  return promise(function(r) {
    model.Subscriber.findOne({accountAlias: subscriberAlias}, r);
  })
  .then(checkNotFound)
  .then(function(savedSubscriber) {
    subscriber = savedSubscriber;
    return stripeClient.customers.update(subscriber.stripeCustomerId, {card: cardToken});
  })
  .then(function(stripeCustomer) {
    return promise(function(r) {
      subscriber.activeCard = _.pick(stripeCustomer.active_card,
        'exp_month',
        'exp_year',
        'name',
        'fingerprint',
        'last4',
        'country',
        'address_line1',
        'address_line2',
        'address_city',
        'address_state',
        'address_zip',
        'address_country',
        'type');

      subscriber.billing = {
        streetAddress1: subscriber.activeCard.address_line1,
        city: subscriber.activeCard.address_city,
        state: subscriber.activeCard.address_state,
        zipcode: subscriber.activeCard.address_zip
      };

      subscriber.save(function(err, subscriber) {
        r(err, subscriber);
      });
    });
  });
}

function addSubscriptionForSubscriber(subscriberAlias, productAlias, planAlias, startDate) {
  return when.join(
    promise(function(r) {
      model.Subscriber.findOne({accountAlias: subscriberAlias}, r);
    })
    .then(checkNotFound),

    promise(function(r) {
      model.Product.findOne({alias: productAlias}, r);
    })
    .then(checkNotFound)
  )
  .then(function(values) {
    var subscriber = values[0];
    var product = values[1];

    subscriber.subscriptions.push({
      product: product,
      plan: planAlias,
      startDate: startDate || Date.today(),
      status: 'Active'
    });

    return promise(function(r) {
      subscriber.save(function(err, subscriber) {
        r(err, subscriber);
      });
    });
  });
}

function findSubscriberWithProducts(subscriberAlias) {
  return promise(function(r) {
    model.Subscriber
      .findOne({accountAlias: subscriberAlias})
      .populate('subscriptions.product')
      .exec(r);
  })
  .then(checkNotFound);
}

function changeSeats(subscriberAlias, productAlias, seatAlias, delta, memo) {
  var subscriber = null;
  var subscription = null;
  var component = null;

  // NOTE: assume product is only subscribed once...
  return findSubscriberWithProducts(subscriberAlias)
    .then(function(savedSubscriber) {
      // TODO: handle missing subscriber, subscription or component
      subscriber = savedSubscriber;
      subscription = _.find(subscriber.subscriptions, function(subscription) {
        return subscription.product.alias == productAlias;
      });
      component = _.find(subscription.product.components, {kind: 'Seat', alias: seatAlias});

      if (null == subscription) {
        throw InternalError('Could not find subscription');
      }

      if (null == component) {
        throw InternalError('Could not find component');
      }
    })
    .then(function() {
      return promise(function(r) {
        model.Usage
          .find({subscription: subscription.id, component: component.id})
          .sort('-timestamp')
          .limit(1)
          .exec(r);
      });
    })
    .then(function(lastUsages) {
      var prevQuantity = null != lastUsages[0] ? lastUsages[0].quantity.valueOf() : 0;

      return promise(function(r) {
        model.Usage.create({
          subscription: subscription.id,
          component: component.id,
          kind: 'Seat',
          name: component.name,
          quantity: prevQuantity + delta,
          memo: memo
        }, r);
      });
    })
    .then(function(usage) {
      return promise(function(r) {
        subscription.usages.push(usage);
        subscriber.save(function(err, subscriber) {
          r(err, subscriber);
        });
      });
    });
}

function recordMeterReading(subscriberAlias, productAlias, meterAlias, value, memo) {
  var subscriber = null;
  var subscription = null;
  var component = null;

  return findSubscriberWithProducts(subscriberAlias)
    .then(function(savedSubscriber) {
      subscriber = savedSubscriber;
      subscription = _.find(subscriber.subscriptions, function(subscription) {
        return subscription.product.alias == productAlias;
      });
      component = _.find(subscription.product.components, {kind:'Metered', alias: meterAlias});
    })
    .then(function() {
      return promise(function(r) {
        model.Usage.create({
          subscription: subscription.id,
          component: component.id,
          kind: 'Metered',
          name: component.name,
          quantity: value,
          memo: memo
        }, r);
      });
    })
    .then(function(usage) {
      return promise(function(r) {
        subscription.usages.push(usage);
        subscriber.save(function(err, subscriber) {
          r(err, subscriber);
        });
      });
    });
}

function prepareClose(subscriber, closingDate) {
  console.log(util.format('Preparing statement closing for subscriber %s with closing date: %s', subscriber._id, closingDate));
  var statement = null;

  function findLastStatement(subscriber) {
    return promise(function(r) {
      model.Statement.findById(_.last(subscriber.statements), r);
    })
    .then(function(statement) {
      console.log(util.format('Processing statement %s.', statement._id));
      return statement;
    });
  }

  function prepareStatement(lastStatement) {
    console.log(util.format('Preparing statement %s.', lastStatement._id));
    statement = lastStatement;
    statement.endDate = closingDate;
    statement.status = 'Closing';
    return statement;
  }

  function aggregateUsages(statement) {
    var subscriptionIds = _(subscriber.subscriptions).pluck('id').map(ObjectID).value();
    console.log('Collating usages for statement %s with subscriptions %j', subscriptionIds);
    return promise(function(r) {
      model.Usage.aggregate(subscriptionIds, statement.startDate, statement.endDate.clone().addDays(1), r);
    });
  }

  function computeComponentCharge(component, totalQuantity, initCharge) {
    return _.reduce(component.pricing, function(charge, tier) {
      var quantity = 0;
      if (null != tier.end && totalQuantity >= tier.end) {
        quantity = tier.end - tier.start + 1;
      } else if (totalQuantity >= tier.start) {
        quantity = totalQuantity - tier.start + 1;
      }
      charge.total += tier.unitcost * quantity;
      return charge;
    }, initCharge);
  }

  function computeCharges(usages) {
    console.log('Computing charges for statement %s', statement._id);

    return _(subscriber.subscriptions)
      .map(function(subscription) {
        var plan = _.find(subscription.product.plans, {alias: subscription.plan});

        return [
          // Charge for the plan
          {
            kind: 'Recurring',
            detail: util.format('%s - %s (%s - %s)', subscription.product.name, subscription.plan, statement.startDate.toFormat('MM/DD/YYYY'), statement.endDate.toFormat('MM/DD/YYYY')),
            unit: plan.unitcost,
            quantity: 1
          },

          // Charge for the seats
          _(usages.seats)
            .where({subscription: subscription._id})
            .map(function(seat) {
              var component = subscription.product.components.id(seat.component);
              var overrideComponent = _.find(plan.components, {alias: component.alias});
              var effectiveComponent = overrideComponent || component;

              return computeComponentCharge(effectiveComponent, seat.quantity, {
                kind: 'Seat',
                detail: component.name,
                quantity: seat.quantity,
                total: 0.0
              });
            })
            .value(),

          // Charge for the metered components
          _(usages.meteres)
            .where({subscription: subscription._id})
            .map(function(meter) {
              var component = subscription.product.components.id(meter.component);
              var overrideComponent = _.find(plan.components, {alias: component.alias});
              var effectiveComponent = overrideComponent || component;

              return computeComponentCharge(effectiveComponent, meter.quantity, {
                kind: 'Metered',
                detail: component.name,
                quantity: meter.quantity,
                total: 0.0
              });
            })
            .value()
        ];
      })
      .flatten()
      .value();
  }

  function total(charges) {
    return _.reduce(charges, function(total, charge) {
      return total += (null == charge.total) ? charge.unit * charge.quantity : charge.total;
    }, 0.0);
  }

  function recordCharges(charges) {
    console.log('Recording charges on statement %s', statement._id);
    statement.charges = charges;
    statement.balanceDue = statement.openingBalance + total(charges);
    return promise(function(r) {
      statement.save(function(err, statement) {
        r(err, statement);
      });
    });
  }

  return findLastStatement(subscriber)
    .then(prepareStatement)
    .then(aggregateUsages)
    .then(computeCharges)
    .then(recordCharges);
}

function chargeCustomer(subscriber, statement, closingDate) {
  console.log('Processing charges for statement %s', statement._id);

  return stripeClient.charges.create({
    amount: statement.balanceDue,
    currency: 'usd',
    customer: subscriber.stripeCustomerId,
    description: util.format('Charge for statement ending %s.', closingDate.toFormat('MM/DD/YYYY'))
  })
  .then(function(charge) {
    return promise(function(r) {
      console.log('Charge processed: %s', charge.id);

      statement.payments.push({
        timestamp: charge.created * 1000,
        success: true,
        kind: 'Credit Card',
        amount: charge.amount,
        message: util.format('Charged card ending in %s', charge.card.last4),
        stripeChargeId: charge.id
      });

      // TODO: what should we do if balanceDue and charge amount are the same
      statement.balanceDue = Math.max(statement.balanceDue - charge.amount, 0);

      statement.paid = (statement.balanceDue === 0);
      statement.paymentDate = charge.created * 1000;
      statement.status = 'Charged';
      statement.save(function(err, statement) {
        r(err, statement);
      });
    });
  }, function(err) {
    console.error('Charge failed -', err);

    if (!(err instanceof stripe.CardError)) {
      throw err;
    }

    var failedPayment = {
      timestamp: Date.now(),
      success: false,
      kind: 'Credit Card',
      amount: statement.balanceDue,
      message: err.message
    };

    if (err.error.charge) {
      failedPayment = _.assign(failedPayment, {stripeChargeId: err.error.charge});
    }

    return promise(function(r) {
      statement.payments.push(failedPayment);
      statement.status = 'Charged';
      statement.save(function(err, statement) {
        r(err, statement);
      });
    });
  });
}

function reallyCloseStatement(statement, subscriber) {
  console.log('Really closing off statement %s.', statement._id);

  return promise(function(r) {
    statement.currentCharges = _.reduce(statement.charges, function(currentCharges, charge) {
      var total = charge.total ? charge.total : charge.quantity * charge.unit;
      currentCharges = currentCharges + total;
      return currentCharges;
    }, 0.0);

    statement.currentPayments = _.reduce(statement.payments, function(currentPayments, payment) {
      var paymentAmount = payment.success ? payment.amount : 0;
      return currentPayments + paymentAmount;
    }, 0.0);

    var contactName = (subscriber.contactFirstName || '') + ' ' + (subscriber.contactLastName || '');

    statement.contact = {
      name: contactName,
      email: subscriber.email
    };

    statement.billing = _.pick(subscriber.billing, 'streetAddress1', 'city', 'state', 'zip');

    statement.status = 'Closed';
    statement.save(function(err, statement) {
      r(err, statement);
    });
  });
}

function createNextStatement(subscriber, startDate, openingBalance) {
  console.log(util.format('Creating next statement for subscriber %s with start date of: %s', subscriber.accountAlias, startDate));

  return promise(function(r) {
    model.Statement.create({
      subscriber: subscriber.id,
      startDate: startDate,
      openingBalance: openingBalance,
      status: 'Open'
    }, r);
  })
  .then(function(statement) {
    subscriber.statements.push(statement);
    return promise(function(r) {
      subscriber.save(function(err, subscriber) {
        r(err, subscriber);
      });
    });
  });
}

function closeStatement(subscriberAlias, closingDate) {
  // TODO: make close statement idempotent
  // TODO: make close statement an orchestration
  var subscriber = null;

  return promise(function(r) {
    model.Subscriber
      .findOne({accountAlias: subscriberAlias})
      .populate('subscriptions.product')
      .exec(r);
  })
  .then(checkNotFound)
  .then(function prepareStatement(savedSubscriber) {
    subscriber = savedSubscriber;
    return prepareClose(subscriber, closingDate);
  })
  .then(function charge(statement) {
    return chargeCustomer(subscriber, statement, closingDate);
  })
  .then(function reallyClose(statement) {
    return reallyCloseStatement(statement, subscriber);
  })
  .then(function(closedStatement) {
    return createNextStatement(subscriber, closingDate.clone().addDays(1), closedStatement.balanceDue);
  });
  // TODO:  .then(sendNotification)
}

module.exports = {
  products: {
    findAll: findAllProducts,
    findById: findProductById,
    update: updateProduct
  },

  statements: {
    createForSubscriber: createStatementForSubscriber
  },

  subscribers: {
    findAll: findAllSubscribers,
    findByAlias: findSubscriberByAlias,
    create: createSubscriber,
    update: updateSubscriber,
    addCard: addCardForSubscriber,
    addSubscription: addSubscriptionForSubscriber,
    changeSeats: changeSeats,
    recordMeterReading: recordMeterReading,
    closeStatement: closeStatement
  },

  BillingError: BillingError,
  InternalError: InternalError,
  InvalidRequestError: InvalidRequestError,
  NotFoundError: NotFoundError
};