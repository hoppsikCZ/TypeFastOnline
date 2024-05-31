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

app.get('/multiplayer', (req, res) => {
  res.sendFile('multiplayer.html', { root: __dirname + '/public' });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
