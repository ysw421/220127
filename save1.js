const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

let rooms = {};
let players = {};

players.count = 0;

app.use(express.static('.'));

app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});

socket = server.listen(5000);
console.log('server started : http://localhost:5000');


io.on('connection', function(socket){
  console.log('a user connected');
  players.count++;
  io.to(socket.id).emit('connected');
});

io.on('connected', function(socket){
  var inputId = document.getElementById('input_Id');
  var btnStart = document.getElementById('btn_start');

  btnStart.onclick = function(){
    inputId.style.display = 'none';
    btnStart.style.display = 'none';
    socket.emit('start', inputId.value);
  }

});