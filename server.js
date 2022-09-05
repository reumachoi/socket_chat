const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const path = require("path");

// 정적파일 절대경로 설정
app.use(express.static(path.join(__dirname, "public")));

const namespace1 = io.of("/namespace1");
const namespace2 = io.of("/namespace2");

io.on("connection", (socket) => {
  console.log("유저 접속 완료!");

  socket.on("newJoin", (name) => {
    socket.name = name;

    socket.broadcast.emit("update", {
      type: "connect",
      name: "Chatbot",
      message: `${name}님이 접속했습니다.`,
    });

    //socket.join(user.room); // user.room 으로 접속
  });

  socket.on("message", (msg) => {
    const data = { name: socket.name, message: msg };

    // 본인을 제외한 나머지 유저에게 전송
    io.sockets.emit("update", data);
  });

  socket.on("disconnect", () => {
    console.log("유저 접속 끊김!");

    socket.broadcast.emit("update", {
      type: "disconnect",
      name: "SERVER",
      message: socket.name + "님이 나가셨습니다.",
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
