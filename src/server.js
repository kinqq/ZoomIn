import http from "http";
import express from "express";
import { config } from "dotenv";
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: {
    type: "basic",
    username: "kinqq",
    password: process.env.ADMIN_PANNAL_PW,
  },
});

function publicRooms() {
  let {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  sids = [...sids.keys()];
  rooms = [...rooms.keys()];
  return rooms.filter((room) => !sids.includes(room));
}

function countUsers(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nick"] = "Unknown";
  socket.emit("room_change", publicRooms());
  socket.onAny((event) => {
    console.log(event);
  });
  socket.on("enter_room", (roomName, func) => {
    socket.join(roomName);
    func();
    socket.to(roomName).emit("welcome", socket.nick, countUsers(roomName));
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nick, countUsers(room) - 1);
    });
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, func) => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("new_message", msg, socket.nick);
    });
    func();
  });
  socket.on("set_nick", (nick) => {
    socket["nick"] = nick;
  });
  socket.on("count_room", (roomName) => {
    io.sockets.emit("count_room", countUsers(roomName));
  });
});

server.listen(3000);
