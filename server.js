
var io = require('socket.io').listen(8088)
  , static = require('node-static')
  , http = require('http')
  , uuid = require('node-uuid');

var file = new (static.Server)('./');

http.createServer(function(req, res) {
  req.addListener('end', function() {
    file.serve(req, res);
  });
}).listen(8080);

var sessions = {};

io.sockets.on('connection', function(socket) {
  console.log('Socket connected: ', socket.id);

  socket.on('register', function(data, cb) {
    if(!sessions.hasOwnProperty(data.app)) {
      sessions[data.app] = {
        sessionId : uuid.v4(),
        clients : []
      };
    }

    sessions[data.app].clients.push(socket);

    cb({ sessionId : sessions[data.app].sessionId });
  });

  socket.on('imgUpdate', function(canvasData) {
    io.sockets.emit('imgUpdate', canvasData);
  });

  socket.on('mouseMove', function(mousePos) {
    io.sockets.emit('mouseMove', mousePos);
  });

  socket.on('sendMessage', function(data) {
    var clients = sessions[data.app].clients;
    for(var i = 0; i < clients.length; i++) {
      if(clients[i] !== socket) {
        clients[i].emit('incomingMessage', { message : data.message });
      }
    }
  });

});

