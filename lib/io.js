var io = require('socket.io')();

io.on('connection', function (socket) {

  socket.on('messageFeed', function(data){
    console.log(data);
  });

});

module.exports = io;
