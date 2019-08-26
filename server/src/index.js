const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer(function(req, res) {});
server.listen(3000, function() { });

// create the server
const wsServer = new WebSocketServer({
    httpServer: server
});

console.log('Setting up events');
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
  
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log('MESSAGE', message);
      if (message.type === 'utf8') {
        // process WebSocket message
      }
    });
  
    connection.on('close', function(connection) {
      console.log('CLOSE');
    });
  });

console.log('Listening');
