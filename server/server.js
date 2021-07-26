var http = require("http");
var config = require('./../config/config');
var router = require('./../router/routes');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
//var fs = require('fs');
var handlers = require('./../handlers/handlers');
var helpers = require('./../helpers/helpers');
//var path = require('path');
var util = require('util');
var debug = util.debuglog('server');
// Instantiate the server module object
var server = {};
server.httpServer = http.createServer(function(req,res){
    server.unifiedServer(req,res);
});
server.unifiedServer = function(req,res){

    // Parse the url
    var parsedUrl = url.parse(req.url, true);
 
    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
 
    // Get the query string as an object
    var queryStringObject = parsedUrl.query;
 
    // Get the HTTP method
    var method = req.method.toLowerCase();
 
    //Get the headers as an object
    var headers = req.headers;
 
    // Get the payload,if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    
   req.on('end', function() {
        buffer += decoder.end();
 
        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        var chosenHandler = typeof(router.routes[trimmedPath]) !== 'undefined' ? router.routes[trimmedPath] : handlers.notFound;
 
        // If the request is within the public directory use to the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;
 
        // Construct the data object to send to the handler
        var data = {
          'trimmedPath' : trimmedPath,
          'queryStringObject' : queryStringObject,
          'method' : method,
          'headers' : headers,
          'payload' : helpers.parseJsonToObject(buffer)
        };
 
        // Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode,payload,contentType){
 
          // Determine the type of response (fallback to JSON)
          contentType = typeof(contentType) == 'string' ? contentType : 'json';
 
          // Use the status code returned from the handler, or set the default status code to 200
          statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
 
          // Return the response parts that are content-type specific
          var payloadString = '';
          if(contentType == 'json'){
            res.setHeader('Content-Type', 'application/json');
            payload = typeof(payload) == 'object'? payload : {};
            payloadString = JSON.stringify(payload);
          }
 
          if(contentType == 'html'){
            res.setHeader('Content-Type', 'text/html');
            payloadString = typeof(payload) == 'string'? payload : '';
          }
 
          if(contentType == 'favicon'){
            res.setHeader('Content-Type', 'image/x-icon');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
 
          if(contentType == 'plain'){
            res.setHeader('Content-Type', 'text/plain');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
 
          if(contentType == 'css'){
            res.setHeader('Content-Type', 'text/css');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
 
          if(contentType == 'png'){
            res.setHeader('Content-Type', 'image/png');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
          if(contentType == 'svg'){
            res.setHeader('Content-Type', 'image/svg+xml');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
 
          if(contentType == 'jpg'){
            res.setHeader('Content-Type', 'image/jpeg');
            payloadString = typeof(payload) !== 'undefined' ? payload : '';
          }
 
          // Return the response-parts common to all content-types
          res.writeHead(statusCode);
          res.end(payloadString);
 
          // If the response is 200, print green, otherwise print red
          if(statusCode == 200){
            debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          } else {
            debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
          }
        });
 
    });
  };
server.init = function(){
    // Start the HTTP server
    server.httpServer.listen(config.httpPort,function(){
        console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
      });
  };
  
  
   // Export the module
   module.exports = server;
