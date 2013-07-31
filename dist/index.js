'use strict';

var _       = require('lodash');
var express = require('express');
var server  = require('./server');

var staticsPlaceholderIndex = -1;
_.each(server.stack, function(mw, index) {
  if (mw.handle.name == 'staticsPlaceholder') {
    staticsPlaceholderIndex = index;
  }
});

if (-1 != staticsPlaceholderIndex) {
  server.stack.splice(staticsPlaceholderIndex, 0, {
    route:'',
    handle: express.static(__dirname + '/app')
  });
}

console.log('Express Stack');
console.log(server.stack);

var port = process.env.PORT || 9000;
server.listen(port);
console.log('Web Server listening on on PORT ', port);
