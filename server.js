
var io = require('socket.io').listen(8088)
  , static = require('node-static')
  , http = require('http');

var file = new (static.Server)('./');

http.createServer(function(req, res) {
  req.addListener('end', function() {
    file.serve(req, res);
  });
}).listen(8080);

io.sockets.on('connection', function(socket) {
  console.log('Socket connected: ', socket.id);

  socket.on('imgUpdate', function(canvasData) {
    io.sockets.emit('imgUpdate', { data : canvasData.data });
  });

  socket.on('mouseMove', function(mousePos) {
    io.sockets.emit('mouseMove', mousePos);
  });
});

//io.listen(8088);

