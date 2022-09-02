const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const players = {};
io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);
  players[socket.id] = {
    velocity: {
      x: 0,
      y: 0,
    },
    x: Math.floor(Math.random() * 100) + 50,
    y: Math.floor(Math.random() * 100) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  socket.emit('current_players', players);
  socket.broadcast.emit('new_player', players[socket.id]);

  socket.on('player_moved', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].velocity.x = movementData.velocity.x;
    players[socket.id].velocity.y = movementData.velocity.y;
    socket.broadcast.emit('update_positions', players[socket.id]);
  })

  socket.on('disconnect',  () => {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('remove_player', socket.id);
  });
});

app.get('/favicon.ico', (req, res)=> res.status(204));
app.use(function (request, response) {
  response.send("<h2>Hello</h2>");
});
server.listen(process.env.PORT || 8080, () => {
  console.log(`listening on *:${process.env.PORT}`);
});