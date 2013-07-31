'use strict';

var _            = require('lodash');
var util         = require('util');
var when         = require('when');
var nodefn       = require('when/node/function');
var model        = require('../model');
var stripe       = require('./stripe');
var stripeClient = stripe.client(process.env.STRIPE_APIKEY);
var ObjectID = require('mongodb').ObjectID;

function promise(f) {
  var d = when.defer();
  f(nodefn.createCallback(d.resolver));
  return d.promise;
}

function findAllProducts() {
  return promise(function(r) {
    model.Product.find().lean(true).exec(r);
  });
}

function findProductById(id) {
  return promise(function(r) {
    model.Product.findById(id).lean(true).exec(r);
  });
}

// TODO: understand if _.assign destroys mongoose object and therefore preventing validation
function updateProduct(updatedProduct) {
  return promise(function(r) { model.Product.findById(updatedProduct._id, r); })
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
  });
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
    if (null != subscriber) {
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

function addCardForSubscriber(subscriberAlias, cardToken) {
  var subscriber = null;
  return promise(function(r) {
    model.Subscriber.findOne({accountAlias: subscriberAlias}, r);
  })
  .then(function(savedSubscriber) {
    subscriber = savedSubscriber;
    return stripeClient.customers.update(subscriber.stripeCustomerId, {card: cardToken});
  })
  .then(function(stripeCustomer) {
    subscriber.activeCard = _.pick(stripeCustomer.active_card, 'exp_month', 'exp_year', 'name', 'fingerprint', 'last4', 'type');
    return promise(function(r) {
      subscriber.save(function(err, subscriber) {
        r(err, subscriber);
      });
    });
  });
}

function addSubscriptionForSubscriber(subscriberAlias, productAlias, planAlias, startDate) {
  return when.join(promise(function(r) {
    model.Subscriber.findOne({accountAlias: subscriberAlias}, r);
  }),
  promise(function(r) {
    model.Product.findOne({alias: productAlias}, r);
  }))
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
  });
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
  var statement = null;

  function findLastStatement(subscriber) {
    return promise(function(r) {
      model.Statement.findById(_.last(subscriber.statements), r);
    });
  }

  function prepareStatement(lastStatement) {
    statement = lastStatement;
    statement.endDate = closingDate;
    statement.status = 'Closing';
    return statement;
  }

  function aggregateUsages(statement) {
    var subscriptionIds = _(subscriber.subscriptions).pluck('id').map(ObjectID).value();
    return promise(function(r) {
      model.Usage.aggregate(subscriptionIds, statement.startDate, statement.endDate.clone().addDays(1), r);
    });
  }

  function computeComponentCharge(component, totalQuantity, initCharge) {
    return _.reduce(component.pricing, function(charge, tier) {
      var quantity = 0;
      if (totalQuantity >= tier.end) {
        quantity = tier.end - tier.start + 1;
      } else if (totalQuantity >= tier.start) {
        quantity = totalQuantity - tier.start + 1;
      }
      charge.total += tier.unitcost * quantity;
      return charge;
    }, initCharge);
  }

  function computeCharges(usages) {
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
              return computeComponentCharge(component, seat.quantity, {
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
              return computeComponentCharge(component, meter.quantity, {
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
  return stripeClient.charges.create({
    amount: statement.balanceDue,
    currency: 'usd',
    customer: subscriber.stripeCustomerId,
    description: util.format('Charge for statement ending %s.', closingDate.toFormat('MM/DD/YYYY'))
  })
  .then(function(charge) {
    console.log(charge);
    return promise(function(r) {
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
      statement.status = 'Closed';
      statement.save(function(err, statement) {
        r(err, statement);
      });
    });
  }, function(err) {
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
      statement.status = 'Closed';
      statement.save(function(err, statement) {
        r(err, statement);
      });
    });
  });
}

function createNextStatement(subscriber, startDate, openingBalance) {
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
  var subscriber = null;

  return promise(function(r) {
    model.Subscriber
      .findOne({accountAlias: subscriberAlias})
      .populate('subscriptions.product')
      .exec(r);
  })
  .then(function prepareStatement(savedSubscriber) {
    subscriber = savedSubscriber;
    return prepareClose(subscriber, closingDate);
  })
  .then(function charge(statement) {
    return chargeCustomer(subscriber, statement, closingDate);
  })
  .then(function(closedStatement) {
    return createNextStatement(subscriber, closingDate.clone().addDays(1), closedStatement.balanceDue);
  });
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
    addCard: addCardForSubscriber,
    addSubscription: addSubscriptionForSubscriber,
    changeSeats: changeSeats,
    recordMeterReading: recordMeterReading,
    closeStatement: closeStatement
  }
};