const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

/*let users = []

app.post('/multiplayer', (req, res) => {
  res.sendFile('multiplayer.html', { root: __dirname + '/public' });

  if (users.some(user => user.ip == req.body.ip)) {
    users = users.find(user => user.ip == req.body.ip).name = req.body.nickname
  }
  else {
    users.push(new User(req.body.ip, req.body.nickname))
  }
});

setInterval(() => {
  io.emit('users', users.map((user) => {
    return {
      name: user.name,
      wpm: user.wpm
    }
  }))
}, 1000);*/

server.listen(3000, () => {
  console.log('listening on *:3000');
});

class User {
  constructor(ip, nickname) {
    this.ip = ip
    this.name = nickname
    this.wpm = 0
  }
}