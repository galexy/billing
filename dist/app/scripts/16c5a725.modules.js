(function (window, angular, undefined) {
  'use strict';
  angular.module('ngResource', ['ng']).factory('$resource', [
    '$http',
    '$parse',
    function ($http, $parse) {
      var DEFAULT_ACTIONS = {
          'get': { method: 'GET' },
          'save': { method: 'POST' },
          'query': {
            method: 'GET',
            isArray: true
          },
          'remove': { method: 'DELETE' },
          'delete': { method: 'DELETE' }
        };
      var noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction, getter = function (obj, path) {
          return $parse(path)(obj);
        };
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
      }
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
      }
      function Route(template, defaults) {
        this.template = template = template + '#';
        this.defaults = defaults || {};
        var urlParams = this.urlParams = {};
        forEach(template.split(/\W/), function (param) {
          if (param && new RegExp('(^|[^\\\\]):' + param + '\\W').test(template)) {
            urlParams[param] = true;
          }
        });
        this.template = template.replace(/\\:/g, ':');
      }
      Route.prototype = {
        url: function (params) {
          var self = this, url = this.template, val, encodedVal;
          params = params || {};
          forEach(this.urlParams, function (_, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              encodedVal = encodeUriSegment(val);
              url = url.replace(new RegExp(':' + urlParam + '(\\W)', 'g'), encodedVal + '$1');
            } else {
              url = url.replace(new RegExp('(/?):' + urlParam + '(\\W)', 'g'), function (match, leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });
          url = url.replace(/\/?#$/, '');
          var query = [];
          forEach(params, function (value, key) {
            if (!self.urlParams[key]) {
              query.push(encodeUriQuery(key) + '=' + encodeUriQuery(value));
            }
          });
          query.sort();
          url = url.replace(/\/*$/, '');
          return url + (query.length ? '?' + query.join('&') : '');
        }
      };
      function ResourceFactory(url, paramDefaults, actions) {
        var route = new Route(url);
        actions = extend({}, DEFAULT_ACTIONS, actions);
        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function (value, key) {
            ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
          });
          return ids;
        }
        function Resource(value) {
          copy(value || {}, this);
        }
        forEach(actions, function (action, name) {
          action.method = angular.uppercase(action.method);
          var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
          Resource[name] = function (a1, a2, a3, a4) {
            var params = {};
            var data;
            var success = noop;
            var error = null;
            switch (arguments.length) {
            case 4:
              error = a4;
              success = a3;
            case 3:
            case 2:
              if (isFunction(a2)) {
                if (isFunction(a1)) {
                  success = a1;
                  error = a2;
                  break;
                }
                success = a2;
                error = a3;
              } else {
                params = a1;
                data = a2;
                success = a3;
                break;
              }
            case 1:
              if (isFunction(a1))
                success = a1;
              else if (hasBody)
                data = a1;
              else
                params = a1;
              break;
            case 0:
              break;
            default:
              throw 'Expected between 0-4 arguments [params, data, success, error], got ' + arguments.length + ' arguments.';
            }
            var value = this instanceof Resource ? this : action.isArray ? [] : new Resource(data);
            $http({
              method: action.method,
              url: route.url(extend({}, extractParams(data, action.params || {}), params)),
              data: data
            }).then(function (response) {
              var data = response.data;
              if (data) {
                if (action.isArray) {
                  value.length = 0;
                  forEach(data, function (item) {
                    value.push(new Resource(item));
                  });
                } else {
                  copy(data, value);
                }
              }
              (success || noop)(value, response.headers);
            }, error);
            return value;
          };
          Resource.prototype['$' + name] = function (a1, a2, a3) {
            var params = extractParams(this), success = noop, error;
            switch (arguments.length) {
            case 3:
              params = a1;
              success = a2;
              error = a3;
              break;
            case 2:
            case 1:
              if (isFunction(a1)) {
                success = a1;
                error = a2;
              } else {
                params = a1;
                success = a2 || noop;
              }
            case 0:
              break;
            default:
              throw 'Expected between 1-3 arguments [params, success, error], got ' + arguments.length + ' arguments.';
            }
            var data = hasBody ? this : undefined;
            Resource[name].call(this, params, data, success, error);
          };
        });
        Resource.bind = function (additionalParamDefaults) {
          return ResourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };
        return Resource;
      }
      return ResourceFactory;
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function ($rootScope, $browser) {
      var cookies = {}, lastCookies = {}, lastBrowserCookies, runEval = false, copy = angular.copy, isUndefined = angular.isUndefined;
      $browser.addPollFn(function () {
        var currentCookies = $browser.cookies();
        if (lastBrowserCookies != currentCookies) {
          lastBrowserCookies = currentCookies;
          copy(currentCookies, lastCookies);
          copy(currentCookies, cookies);
          if (runEval)
            $rootScope.$apply();
        }
      })();
      runEval = true;
      $rootScope.$watch(push);
      return cookies;
      function push() {
        var name, value, browserCookies, updated;
        for (name in lastCookies) {
          if (isUndefined(cookies[name])) {
            $browser.cookies(name, undefined);
          }
        }
        for (name in cookies) {
          value = cookies[name];
          if (!angular.isString(value)) {
            if (angular.isDefined(lastCookies[name])) {
              cookies[name] = lastCookies[name];
            } else {
              delete cookies[name];
            }
          } else if (value !== lastCookies[name]) {
            $browser.cookies(name, value);
            updated = true;
          }
        }
        if (updated) {
          updated = false;
          browserCookies = $browser.cookies();
          for (name in cookies) {
            if (cookies[name] !== browserCookies[name]) {
              if (isUndefined(browserCookies[name])) {
                delete cookies[name];
              } else {
                cookies[name] = browserCookies[name];
              }
              updated = true;
            }
          }
        }
      }
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function ($cookies) {
      return {
        get: function (key) {
          var value = $cookies[key];
          return value ? angular.fromJson(value) : value;
        },
        put: function (key, value) {
          $cookies[key] = angular.toJson(value);
        },
        remove: function (key) {
          delete $cookies[key];
        }
      };
    }
  ]);
}(window, window.angular));
(function (window, angular, undefined) {
  'use strict';
  var $sanitize = function (html) {
    var buf = [];
    htmlParser(html, htmlSanitizeWriter(buf));
    return buf.join('');
  };
  var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/, END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\s*\//, COMMENT_REGEXP = /<!--(.*?)-->/g, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#)/, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;
  var voidElements = makeMap('area,br,col,hr,img,wbr');
  var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'), optionalEndTagInlineElements = makeMap('rp,rt'), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
  var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap('address,article,aside,' + 'blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,' + 'header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul'));
  var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,bdi,bdo,' + 'big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,' + 'span,strike,strong,sub,sup,time,tt,u,var'));
  var specialElements = makeMap('script,style');
  var validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
  var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
  var validAttrs = angular.extend({}, uriAttrs, makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' + 'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' + 'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' + 'scope,scrolling,shape,span,start,summary,target,title,type,' + 'valign,value,vspace,width'));
  function makeMap(str) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
  function htmlParser(html, handler) {
    var index, chars, match, stack = [], last = html;
    stack.last = function () {
      return stack[stack.length - 1];
    };
    while (html) {
      chars = true;
      if (!stack.last() || !specialElements[stack.last()]) {
        if (html.indexOf('<!--') === 0) {
          index = html.indexOf('-->');
          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
        } else if (BEGING_END_TAGE_REGEXP.test(html)) {
          match = html.match(END_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(END_TAG_REGEXP, parseEndTag);
            chars = false;
          }
        } else if (BEGIN_TAG_REGEXP.test(html)) {
          match = html.match(START_TAG_REGEXP);
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
            chars = false;
          }
        }
        if (chars) {
          index = html.indexOf('<');
          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);
          if (handler.chars)
            handler.chars(decodeEntities(text));
        }
      } else {
        html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.last() + '[^>]*>', 'i'), function (all, text) {
          text = text.replace(COMMENT_REGEXP, '$1').replace(CDATA_REGEXP, '$1');
          if (handler.chars)
            handler.chars(decodeEntities(text));
          return '';
        });
        parseEndTag('', stack.last());
      }
      if (html == last) {
        throw 'Parse Error: ' + html;
      }
      last = html;
    }
    parseEndTag();
    function parseStartTag(tag, tagName, rest, unary) {
      tagName = angular.lowercase(tagName);
      if (blockElements[tagName]) {
        while (stack.last() && inlineElements[stack.last()]) {
          parseEndTag('', stack.last());
        }
      }
      if (optionalEndTagElements[tagName] && stack.last() == tagName) {
        parseEndTag('', tagName);
      }
      unary = voidElements[tagName] || !!unary;
      if (!unary)
        stack.push(tagName);
      var attrs = {};
      rest.replace(ATTR_REGEXP, function (match, name, doubleQuotedValue, singleQoutedValue, unqoutedValue) {
        var value = doubleQuotedValue || singleQoutedValue || unqoutedValue || '';
        attrs[name] = decodeEntities(value);
      });
      if (handler.start)
        handler.start(tagName, attrs, unary);
    }
    function parseEndTag(tag, tagName) {
      var pos = 0, i;
      tagName = angular.lowercase(tagName);
      if (tagName)
        for (pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;
      if (pos >= 0) {
        for (i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);
        stack.length = pos;
      }
    }
  }
  var hiddenPre = document.createElement('pre');
  function decodeEntities(value) {
    hiddenPre.innerHTML = value.replace(/</g, '&lt;');
    return hiddenPre.innerText || hiddenPre.textContent || '';
  }
  function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(NON_ALPHANUMERIC_REGEXP, function (value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function htmlSanitizeWriter(buf) {
    var ignore = false;
    var out = angular.bind(buf, buf.push);
    return {
      start: function (tag, attrs, unary) {
        tag = angular.lowercase(tag);
        if (!ignore && specialElements[tag]) {
          ignore = tag;
        }
        if (!ignore && validElements[tag] == true) {
          out('<');
          out(tag);
          angular.forEach(attrs, function (value, key) {
            var lkey = angular.lowercase(key);
            if (validAttrs[lkey] == true && (uriAttrs[lkey] !== true || value.match(URI_REGEXP))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out(unary ? '/>' : '>');
        }
      },
      end: function (tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
      chars: function (chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
    };
  }
  angular.module('ngSanitize', []).value('$sanitize', $sanitize);
  angular.module('ngSanitize').directive('ngBindHtml', [
    '$sanitize',
    function ($sanitize) {
      return function (scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.ngBindHtml);
        scope.$watch(attr.ngBindHtml, function ngBindHtmlWatchAction(value) {
          value = $sanitize(value);
          element.html(value || '');
        });
      };
    }
  ]);
  angular.module('ngSanitize').filter('linky', function () {
    var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/, MAILTO_REGEXP = /^mailto:/;
    return function (text) {
      if (!text)
        return text;
      var match;
      var raw = text;
      var html = [];
      var writer = htmlSanitizeWriter(html);
      var url;
      var i;
      while (match = raw.match(LINKY_URL_REGEXP)) {
        url = match[0];
        if (match[2] == match[3])
          url = 'mailto:' + url;
        i = match.index;
        writer.chars(raw.substr(0, i));
        writer.start('a', { href: url });
        writer.chars(match[0].replace(MAILTO_REGEXP, ''));
        writer.end('a');
        raw = raw.substring(i + match[0].length);
      }
      writer.chars(raw);
      return html.join('');
    };
  });
}(window, window.angular));
'use strict';
angular.module('billingApp').directive('dateinput', [
  '$filter',
  function ($filter) {
    function isoDateFormat(d) {
      function pad(n) {
        return n < 10 ? '0' + n : n;
      }
      return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
    }
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function postLink(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (value) {
          return isoDateFormat(new Date(value));
        });
        ngModel.$formatters.push(function (value) {
          return $filter('date')(value, 'MM/dd/yyyy');
        });
        $(element).datepicker({ format: 'mm/dd/yyyy' }).on('changeDate', function (ev) {
          scope.$apply(function () {
            ngModel.$setViewValue(element.val());
          });
          $(element).datepicker('hide');
        });
      }
    };
  }
]);
'use strict';
angular.module('billingApp').directive('money', [
  '$filter',
  function ($filter) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function postLink(scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }
        ngModel.$formatters.push(function (value) {
          return value / 100;
        });
        ngModel.$parsers.push(function (value) {
          return value * 100;
        });
      }
    };
  }
]);
'use strict';
angular.module('billingApp').directive('nav', [
  '$location',
  function ($location) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$on('$routeChangeSuccess', function (e, current, previous) {
          var path = '#' + $location.path();
          $(element).find('li').removeClass('active');
          $(element).find('li a').filter(function () {
            return 0 === path.indexOf($(this).attr('href'));
          }).first().parent().addClass('active');
        });
      }
    };
  }
]);
'use strict';
angular.module('billingApp').filter('cents', [
  '$filter',
  function ($filter) {
    return function (input) {
      input = input || 0;
      return $filter('currency')(input / 100, '$');
    };
  }
]);
'use strict';
angular.module('billingApp').filter('infinte', function () {
  return function (input) {
    return angular.isNumber(input) ? input : '\u221e';
  };
});
'use strict';
angular.module('billingApp').filter('prepend', function () {
  return function (input, prefix) {
    return null == input ? '' : prefix + input;
  };
});
'use strict';
angular.module('billingApp').service('AuthenticationService', [
  '$http',
  '$timeout',
  '$q',
  'Session',
  'Flash',
  function AuthenticationService($http, $timeout, $q, Session, Flash) {
    this.login = function (credentials) {
      var login = $http.post('/login', credentials);
      login.success(function (user) {
        Session.set('user', user);
        Flash.clear();
      }).error(function (error) {
        error = error.error ? error.error : error;
        Flash.show(error.message || error);
      });
      return login;
    };
    this.logout = function () {
      var logout = $http.get('/logout');
      logout.success(function () {
        Session.clear();
      });
      return logout;
    };
    this.user = function () {
      var user = Session.get('user');
      if (user) {
        var deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(user);
        }, 0);
        return deferred.promise;
      } else {
        return $http.get('/user');
      }
    };
  }
]);
'use strict';
angular.module('billingApp').service('Flash', [
  '$rootScope',
  function Flash($rootScope) {
    this.show = function (message) {
      $rootScope.flash = message;
    };
    this.clear = function () {
      $rootScope.flash = '';
    };
  }
]);
'use strict';
angular.module('billingApp').factory('Product', [
  '$resource',
  function Product($resource) {
    return $resource('/ajax/products/:productId', { productId: '@_id' }, { save: { method: 'PUT' } });
  }
]);
'use strict';
angular.module('billingApp').service('Session', function Session() {
  this.get = function (key) {
    return sessionStorage.getItem(key);
  };
  this.set = function (key, value) {
    return sessionStorage.setItem(key, value);
  };
  this.unset = function (key) {
    return sessionStorage.removeItem(key);
  };
  this.clear = function () {
    return sessionStorage.clear();
  };
});
'use strict';
angular.module('billingApp').factory('Subscriber', [
  '$resource',
  function Subscriber($resource) {
    return $resource('/ajax/subscribers/:subscriberAlias/:cmd', { subscriberAlias: '@accountAlias' }, {
      save: { method: 'PUT' },
      create: {
        method: 'POST',
        params: { subscriberAlias: '' }
      },
      addCard: {
        method: 'POST',
        params: { cmd: 'addCard' }
      },
      addSubscription: {
        method: 'POST',
        params: { cmd: 'addSubscription' }
      },
      closeStatement: {
        method: 'POST',
        params: { cmd: 'closeStatement' }
      }
    });
  }
]);
'use strict';
angular.module('billingApp').controller('CreditCardDialogCtrl', [
  '$scope',
  '$window',
  'dialog',
  function ($scope, $window, dialog) {
    $scope.cancel = function () {
      dialog.close();
    };
    $scope.addCard = function () {
      $window.Stripe.createToken({
        number: $scope.number,
        cvc: $scope.cvc,
        exp_month: $scope.exp_month,
        exp_year: $scope.exp_year,
        address_line1: $scope.address_line1,
        address_city: $scope.address_city,
        address_state: $scope.address_state,
        address_zip: $scope.address_zip
      }, function (status, response) {
        if (response.error) {
          console.log(response.error);
        }
        dialog.close(response.id);
      });
    };
  }
]);
'use strict';
angular.module('billingApp').controller('LoginCtrl', [
  '$scope',
  '$location',
  'AuthenticationService',
  function ($scope, $location, AuthenticationService) {
    $scope.sampleUsers = [
      {
        username: 'admin',
        password: 'pass'
      },
      {
        username: 'user',
        password: 'pass'
      }
    ];
    $scope.login = function () {
      AuthenticationService.login(this.credentials).success(function () {
        $location.path('/');
      });
    };
  }
]);
'use strict';
angular.module('billingApp').controller('ProductsCtrl', [
  '$scope',
  'Product',
  function ($scope, Product) {
    $scope.products = Product.query();
  }
]);
'use strict';
angular.module('billingApp').controller('SubscriberCtrl', [
  '$scope',
  '$routeParams',
  '$window',
  '$dialog',
  'Subscriber',
  function ($scope, $routeParams, $window, $dialog, Subscriber) {
    $scope.isNew = angular.isUndefined($routeParams.subscriberAlias);
    $scope.subscriber = $scope.isNew ? {} : Subscriber.get($routeParams);
    $scope.save = function () {
      var updater = $scope.isNew ? Subscriber.create.bind(Subscriber, $scope.subscriber) : $scope.subscriber.$save.bind($scope.subscriber);
      updater(function () {
        $window.history.back();
      }, function (err) {
      });
    };
    $scope.cancel = function () {
      $window.history.back();
    };
    $scope.addCreditCard = function () {
      var d = $dialog.dialog({
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          dialogFade: true,
          templateUrl: 'views/creditcarddialog.html',
          controller: 'CreditCardDialogCtrl'
        });
      d.open().then(function (token) {
        $scope.subscriber.$addCard({ token: token }, function () {
          console.log('looky');
        }, function (err) {
          console.log(err);
        });
      });
    };
    $scope.addSubscription = function () {
      var d = $dialog.dialog({
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          dialogFade: true,
          templateUrl: 'views/subscriptiondialog.html',
          controller: 'SubscriptionDialogCtrl'
        });
      d.open().then(function (subscription) {
        $scope.subscriber.$addSubscription({
          product: subscription.product.alias,
          plan: subscription.plan.alias,
          startDate: subscription.startDate
        }, function () {
          console.log('looky');
        }, function (err) {
          console.log(err);
        });
      });
    };
    $scope.closeStatement = function () {
      $scope.subscriber.$closeStatement({ closingDate: new Date().valueOf() }, function () {
        console.log('look ma, no hands');
      }, function (err) {
        console.log(err);
      });
    };
  }
]);
'use strict';
angular.module('billingApp').controller('ProductCtrl', [
  '$scope',
  '$routeParams',
  '$location',
  'Product',
  function ($scope, $routeParams, $location, Product) {
    $scope.product = Product.get($routeParams);
    $scope.addComponent = function () {
      $location.path('/products/' + $routeParams.productId + '/components/new');
    };
    $scope.addPlan = function () {
      $location.path('/products/' + $routeParams.productId + '/plans/new');
    };
  }
]);
'use strict';
angular.module('billingApp').controller('PlanCtrl', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  '$window',
  '$dialog',
  'Product',
  function ($scope, $rootScope, $routeParams, $location, $window, $dialog, Product) {
    $scope.product = Product.get({ productId: $routeParams.productId }, function (product) {
      if ($routeParams.planId === 'new') {
        $scope.plan = {};
        $scope.product.plans.push($scope.plan);
      } else {
        $scope.plan = _.find($scope.product.plans, { _id: $routeParams.planId });
      }
    });
    $scope.$watch('product.components', function () {
      $rootScope.availableComponents = _.reject($scope.product.components, function (component) {
        return _.any($scope.plan.components || [], { name: component.name });
      });
    });
    $scope.addComponent = function () {
      var d = $dialog.dialog({
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          dialogFade: true,
          templateUrl: 'views/componentdialog.html',
          controller: 'ComponentDialogCtrl'
        });
      d.open().then(function (result) {
        var override = _.omit(result, '_id', 'pricing');
        override.pricing = _.map(result.pricing, function (tier) {
          return _.omit(tier, '_id');
        });
        $scope.plan.components = $scope.plan.components || [];
        $scope.plan.components.push(override);
      });
    };
    $scope.save = function save() {
      $scope.product.$save(function () {
        $location.path('/products/' + $routeParams.productId);
      }, function () {
      });
    };
    $scope.cancel = function cancel() {
      $window.history.back();
    };
    $scope.deletePlan = function deletePlan() {
      $scope.product.plans = _.without($scope.product.plans, $scope.plan);
      $scope.product.$save(function () {
        $location.path('/products/' + $routeParams.productId);
      }, function () {
      });
    };
  }
]);
'use strict';
angular.module('billingApp').controller('ComponentCtrl', [
  '$scope',
  '$routeParams',
  '$location',
  '$window',
  'Product',
  function ($scope, $routeParams, $location, $window, Product) {
    $scope.componentKinds = [
      'Metered',
      'Seat'
    ];
    $scope.isPlanOverride = !angular.isUndefined($routeParams.planId);
    $scope.product = Product.get({ productId: $routeParams.productId }, function (product) {
      var components = $scope.isPlanOverride ? _.find(product.plans, { _id: $routeParams.planId }).components : product.components;
      if ($routeParams.componentId === 'new') {
        $scope.component = { pricing: [] };
        components.push($scope.component);
      } else {
        $scope.component = _.find(components, { _id: $routeParams.componentId });
      }
    });
    $scope.addTier = function () {
      $scope.component.pricing.push({});
    };
    $scope.removeTier = function (index) {
      $scope.component.pricing.splice(index, 1);
    };
    $scope.save = function () {
      $scope.product.$save(function () {
        $window.history.back();
      }, function () {
      });
    };
    $scope.cancel = function () {
      $window.history.back();
    };
    $scope.deleteComponent = function () {
      $scope.product.components = _.without($scope.product.components, $scope.component);
      $scope.save();
    };
  }
]);
'use strict';
angular.module('billingApp').controller('ComponentDialogCtrl', [
  '$scope',
  'dialog',
  function ($scope, dialog) {
    $scope.close = function (result) {
      dialog.close(result);
    };
  }
]);
'use strict';
angular.module('billingApp').controller('SubscribersCtrl', [
  '$scope',
  'Subscriber',
  function ($scope, Subscriber) {
    $scope.subscribers = Subscriber.query();
  }
]);
'use strict';
angular.module('billingApp').controller('SubscriptionDialogCtrl', [
  '$scope',
  'dialog',
  'Product',
  function ($scope, dialog, Product) {
    $scope.availableProducts = Product.query();
    $scope.cancel = function () {
      dialog.close();
    };
    $scope.addSubscription = function () {
      dialog.close(_.pick($scope, 'product', 'plan', 'startDate'));
    };
  }
]);
'use strict';
angular.module('billingApp').controller('SubscriptionDetailCtrl', [
  '$scope',
  '$routeParams',
  'Subscriber',
  function ($scope, $routeParams, Subscriber) {
    $scope.subscriber = Subscriber.get({ subscriberAlias: $routeParams.subscriberAlias }, function (subscriber) {
      $scope.subscription = _.find(subscriber.subscriptions, { _id: $routeParams.subscriptionId });
    }, function (err) {
      console.log(err);
    });
  }
]);
'use strict';
angular.module('billingApp').filter('yesno', function () {
  return function (input) {
    return input ? 'Yes' : 'No';
  };
});
'use strict';
angular.module('billingApp').controller('StatementCtrl', [
  '$scope',
  '$routeParams',
  'Subscriber',
  function ($scope, $routeParams, Subscriber) {
    $scope.subscriber = Subscriber.get({ subscriberAlias: $routeParams.subscriberAlias }, function (subscriber) {
      $scope.statement = _.find(subscriber.statements, { _id: $routeParams.statementId });
    }, function (err) {
      console.log(err);
    });
  }
]);
'use strict';
angular.module('billingApp').filter('iif', function () {
  return function (predicate, trueValue, falseValue) {
    return predicate ? trueValue : falseValue;
  };
});
'use strict';
angular.module('billingApp').directive('states', function () {
  var states = [
      'AL',
      'AK',
      'AZ',
      'AR',
      'CA',
      'CO',
      'CT',
      'DC',
      'DE',
      'FL',
      'GA',
      'HI',
      'ID',
      'IL',
      'IN',
      'IA',
      'KS',
      'KY',
      'LA',
      'ME',
      'MD',
      'MA',
      'MI',
      'MN',
      'MS',
      'MO',
      'MT',
      'NE',
      'NV',
      'NH',
      'NJ',
      'NM',
      'NY',
      'NC',
      'ND',
      'OH',
      'OK',
      'OR',
      'PA',
      'RI',
      'SC',
      'SD',
      'TN',
      'TX',
      'UT',
      'VT',
      'VA',
      'WA',
      'WV',
      'WI',
      'WY'
    ];
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      var $element = $(element);
      _.each(states, function (state) {
        var $option = $('<option/>').attr('value', state).text(state);
        $element.append($option);
      });
    }
  };
});