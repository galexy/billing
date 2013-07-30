'use strict';

var _            = require('lodash');
var when         = require('when');
var nodefn       = require('when/node/function');
var model        = require('../model');
var stripe       = require('./stripe');
var stripeClient = stripe.client(process.env.STRIPE_APIKEY);

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

function finaProductById(id) {
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
  console.log(subscriber)
  console.log({
      subscriber: subscriber._id,
      startDate: subscriber.startDate,
      openingBalance: 0,
      status: 'Open'
    });
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

function findSubscriberById(id) {
  return promise(function(r) {
    model.Subscriber
      .findById(id)
      .lean(true)
      .populate('statements subscriptions.product')
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
    subscriber.remove();
    return err;
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

function addCardForSubscriber(subscriberId, cardToken) {
  var subscriber = null;
  return promise(function(r) {
    model.Subscriber.findById(subscriberId, r);
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

function addSubscriptionForSubscriber(subscriberId, productAlias, planAlias, startDate) {
  return when.join(promise(function(r) {
    model.Subscriber.findById(subscriberId, r);
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

module.exports = {
  products: {
    findAll: findAllProducts,
    findById: finaProductById,
    update: updateProduct
  },

  statements: {
    createForSubscriber: createStatementForSubscriber
  },

  subscribers: {
    findAll: findAllSubscribers,
    findById: findSubscriberById,
    create: createSubscriber,
    addCard: addCardForSubscriber,
    addSubscription: addSubscriptionForSubscriber
  }
};