import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = null;
    socket.on("open", () => {
        console.log("Connected to Browser ✅");
    });
    socket.on("close", () => {
        console.log("Disconnected From Client ⛔");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg.toString());
        switch (message.type) {
            case "message":
                sockets.forEach((sock) => {
                    if (sock !== socket)
                        sock.send(
                            `${
                                socket["nickname"]
                                    ? socket["nickname"]
                                    : "Anonymous"
                            }: ${message.value}`
                        );
                });
            case "nickname":
                socket["nickname"] = message.value;
        }
    });
});
server.listen(3245);
