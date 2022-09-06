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
  socket.on("new join", (name) => {
    socket.name = name;
    io.emit("notice", name, " 님이 들어오셨습니다");
  });

  socket.on("chat message", (msg) => {
    console.log(socket.name + " : " + msg);
    io.emit("chat message", socket.name, msg);
  });

  socket.on("disconnect", () => {
    io.emit("notice", socket.name, "님이 나가셨습니다");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
