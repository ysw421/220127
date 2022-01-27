const express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');


const PLAYER_MAX_NUM = 100;
const ROOM_MAX_NUM = 16;

let rooms = {};
let players = {};

players.socketId = new Array(PLAYER_MAX_NUM);
players.count = 0;

rooms.idCount = 0;
rooms.count = 0;
rooms.matchingRoomCount = 0;
rooms.id = [];
rooms.states = {};   //0: 대기중 1:게임중 2:게임결과..
//rooms.players = {};
rooms.playersId = {};
rooms.playersSocketId = {};

const RoomMg = new (require("./room/RoomManager.js"))(players, rooms);

app.use(express.static(path.join(__dirname, "js")));

app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});

socket = server.listen(5000);
console.log('server started : http://localhost:5000');

socket.on('disconnect', function () {
  console.log('disconnect');
});


io.on('connection', function(socket){
  var playerRoomId = -1;
  var playerId;

  console.log('a user connected');
  players.count++;
  players.socketId[players.count] = socket.id;

  io.to(socket.id).emit('connected', {socketId: players.count});

  socket.on('disconnect', function(){
    if(playerRoomId != -1){
      leaveRoom(playerRoomId, playerId, socket.id);
    }
  });

  socket.on('matching', function(myId){
    if(rooms.matchingRoomCount == 0) {  //방 만들기
      rooms.idCount++;
      rooms.count++;
      rooms.matchingRoomCount++;
      rooms.id.push(rooms.idCount);
      rooms.states[rooms.idCount] = 0;
      rooms.playersId[rooms.idCount] = [];
      rooms.playersId[rooms.idCount].push(myId);
      rooms.playersSocketId[rooms.idCount] = [];
      rooms.playersSocketId[rooms.idCount].push(socket.id);
      socket.join(rooms.idCount);
      playerId = myId;
      playerRoomId = rooms.idCount;
      console.log(rooms.id);
      console.log('roomId : ' + rooms.idCount);
    } else {
      for(let i = 0; i <= rooms.count; i++){
        console.log(rooms.id);
        console.log('roomId11 : ' + rooms.id[i]);
        var roomId = rooms.id[i];
        if(rooms.states[roomId] == 0){
          socket.join(roomId);
          playerId = myId;
          playerRoomId = roomId;
          console.log('roomId : ' + roomId);
          rooms.states[roomId] = 1;
          rooms.playersId[roomId].push(myId);
          rooms.playersSocketId[roomId].push(socket.id);
          console.log(rooms.playersId[roomId]);
          rooms.matchingRoomCount--;
          io.to(roomId).emit('gameStart', {roomId: roomId, playerId: rooms.playersid, socketId: rooms.playerssocketId});
          break;
        }
      }
    }
  });


});

function leaveRoom(playerRoomId, playerId, socketId){
  console.log('leaveRoom');
  console.log('playerRoomId : ' + playerRoomId);
  console.log('playerId : ' + playerId);

  console.log(rooms.playersId[playerRoomId]);
  console.log(rooms.playersId[playerRoomId].indexOf(playerId));

  if(rooms.playersId[playerRoomId].length > 1){
    rooms.states[playerRoomId] = 0;
    rooms.matchingRoomCount++;
    for(let i = 0; i < rooms.playersId[playerRoomId].length; i++){
      if(rooms.playersSocketId[playerRoomId][i] == socketId){
        rooms.playersId[playerRoomId].splice(i, 1);
        rooms.playersSocketId[playerRoomId].splice(i, 1);
        break;
      }
    }
    //io.to(playerRoomId).emit('gameEnd', {roomId: playerRoomId, playerId: rooms.playersId[playerRoomId], socketId: rooms.playersSocketId[playerRoomId]});
    //io.to(playerRoomId).emit('victory', {roomId: playerRoomId, playerId: rooms.playersId[playerRoomId], socketId: rooms.playersSocketId[playerRoomId]});
  } else {
    console.log('방사라짐');
    for(let i = 0; i < rooms.id.length; i++){
      if(rooms.id[i] == playerRoomId){
        rooms.id.splice(i, 1);
        break;
      }
    }
    delete rooms.id[playerRoomId];
    delete rooms.states[playerRoomId];
    delete rooms.playersId[playerRoomId];
    delete rooms.playersSocketId[playerRoomId];
    rooms.count--;
    rooms.matchingRoomCount--;
    //for(let i = 0; i < rooms.playersId[playerRoomId].length; i++){
    //  if(rooms.playersSocketId[playerRoomId][i] == socketId){
    //    delete rooms.playersId[playerRoomId][i];
    //    delete rooms.playersSocketId[playerRoomId][i];
    //    break;
    //  }
    //}
  }
}