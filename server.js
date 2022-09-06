const express = require("express");
const app = express();
const http = require("http");
const { user } = require("pg/lib/defaults");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const users = [];

io.on("connection", (socket) => {
  socket.on("new join room", (preJoinRoom, newJoinRoom, name) => {
    socket.name = name;

    if (preJoinRoom !== "") {
      socket.leave(preJoinRoom);
      io.to(preJoinRoom).emit("notice", socket.name, " 님이 나가셨습니다");
    }

    socket.join(newJoinRoom);
    socket.room = newJoinRoom;
    users.push({ username: socket.name, room: newJoinRoom });
    io.to(newJoinRoom).emit("notice", socket.name, " 님이 들어오셨습니다");
  });

  socket.on("chat message", (msg) => {
    console.log(socket.name + " : " + msg);
    io.to(socket.room).emit("chat message", socket.name, msg);
  });

  socket.on("disconnect", () => {
    io.emit("notice", socket.name, "님이 나가셨습니다");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
