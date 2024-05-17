const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('a user connected');
    users.push(socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users = users.filter(user => user !== socket.id);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
