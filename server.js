const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("new join room", (preJoinRoom, newJoinRoom, name) => {
    socket.name = name;

    socket.join(newJoinRoom);
    socket.room = newJoinRoom;

    let clients = io.sockets.adapter.rooms.get(newJoinRoom);

    const { currentChatRoomUserList, roomClientsNum } = getRoomInfo(clients);

    io.to(newJoinRoom).emit(
      "notice",
      currentChatRoomUserList,
      roomClientsNum,
      socket.name,
      " 님이 들어오셨습니다"
    );

    if (preJoinRoom !== "") {
      socket.leave(preJoinRoom);

      let clients = io.sockets.adapter.rooms.get(preJoinRoom);
      const { currentChatRoomUserList, roomClientsNum } = getRoomInfo(clients);

      io.to(preJoinRoom).emit(
        "notice",
        currentChatRoomUserList,
        roomClientsNum,
        socket.name,
        " 님이 나가셨습니다"
      );
    }
  });

  socket.on("chat message", (msg) => {
    io.to(socket.room).emit("chat message", socket.name, msg);
  });

  socket.on("disconnect", () => {
    let clients = io.sockets.adapter.rooms.get(socket.room);
    const { currentChatRoomUserList, roomClientsNum } = getRoomInfo(clients);

    io.emit(
      "notice",
      currentChatRoomUserList,
      roomClientsNum,
      socket.name,
      "님이 나가셨습니다"
    );
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

function getRoomInfo(clients) {
  const roomClientsNum = clients ? clients.size : 0;

  const currentChatRoomUserList = [];
  if (clients) {
    clients.forEach((element) => {
      currentChatRoomUserList.push(io.sockets.sockets.get(element).name);
    });
  }

  return { roomClientsNum, currentChatRoomUserList };
}
