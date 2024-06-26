const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

class Room { 
  constructor(name) {
    this.name = name;
    this.players = [];
    this.state = 'waiting';
    this.updateCounter = 0;
  }

  update() {
    this.updateCounter++;

    console.log(this.name + ' state: ' + this.state)
    switch (this.state) {
      case 'waiting':
        this.updateWaiting();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      default:
        break;
    }
  }

  updateWaiting() {
    if (this.updateCounter % 10 === 0) {
      if (this.players.length > 1 ) {
        this.startGame();
      }
    }

    io.to(this.name).emit('update players', { players: this.players });
  }

  updatePlaying() {
    let playing = this.players.filter(player => player.state === 'playing')
    io.to(this.name).emit('update players', { players: playing });

    console.log(playing)
    if (playing.every(player => player.progress >= 100)) {
      this.endGame();
    }
  }

  endGame() {
    let playing = this.players.filter(player => player.state === 'playing')
    io.to(this.name).emit('end game', { players: playing });
    this.state = 'waiting';
  }

  startGame() {
    this.state = 'playing';
    this.players.forEach(player => { 
      player.state = 'playing' 
      player.wpm = 60
      player.progress = 0
    })
    fetchWords(20).then(data => {io.to(this.name).emit('start game', { text: data })})
  }
}

class Player {
  constructor(name) {
    this.state = 'waiting'
    this.name = name;
    this.wpm = 0;
    this.progress = 0;
  }
}

let rooms = [];

async function fetchWords(count) {
  const response = await fetch(`https://random-word-api.vercel.app/api?words=${count}`);
  return await response.json();
}

setInterval(() => {
  rooms.forEach(room => {
    room.update()
  });
}, 1000);

app.get('/', (req, res) => {
  const serverData = { multiplayer: false };
  res.render('index.ejs', { serverData });
});

app.post('/multiplayer', (req, res) => {
  if (!req.body.name || !req.body.room) {
    res.status(400).send('Name and room are required');
    return;
  }
  const serverData = {multiplayer: true, nickname: req.body.name, room: req.body.room};
  res.render('index.ejs', { serverData });
});

app.get('/multiplayer', (req, res) => {
  res.status(400).send('Use the main page to join a room');
});

io.on('connection', (socket) => {
  reconnection: false
  socket.nickname = ''
  socket.room = ''
  
  socket.on('join room', (data) => {
    socket.nickname = data.name;
    socket.room = data.room;
    console.log(`${data.name} joined ${data.room}`);
    socket.join(data.room);
    if (!rooms.find(room => room.name === data.room)) {
      socket.join(data.room);
      let room = new Room(data.room);
      let player = new Player(data.name);
      room.players.push(player);
      rooms.push(room);
    }
    else {
      let sameNameCount = 0
      let room = rooms.find(room => room.name === data.room)
      while (room.players.find(player => player.name === data.name + (sameNameCount === 0 ? '' : sameNameCount))) {
        sameNameCount++;
      }

      if (sameNameCount)
        socket.nickname = data.name + sameNameCount
      rooms.find(room => room.name === data.room).players.push(new Player(socket.nickname));
    }
  });

  socket.on('update info', (data) => {
    if (!socket.nickname || !socket.room)
      return

    let player = rooms.find(room => room.name === socket.room).players.find(player => player.name === socket.nickname)
    if (!player) return
    player.wpm = data.wpm;
    player.progress = Math.round(data.progress);
  });

  socket.on('disconnect', (reason) => {

    let room = rooms.find(room => room.name === socket.room)
    if (room) {
      room.players = room.players.filter(e => e.name !== socket.nickname) 
      if (room.players.length === 0) {
        rooms = rooms.filter(e => e !== room)
      }
    }
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
