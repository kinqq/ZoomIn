const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");
const nickForm = form.querySelector("input[placeholder='nick name']");

room.hidden = true;
let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");

  msgForm.addEventListener("submit", handleMessageSubmit);
}

async function handleRoomSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  const nick = welcome.querySelector("input[placeholder='nick name']");
  roomName = input.value;
  nickName = nick.value;
  await socket.emit("set_nick", nickName);
  socket.emit("enter_room", roomName, showRoom);
  input.value = "";
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const msgInput = room.querySelector("#msg input");
  message = msgInput.value;
  socket.emit("new_message", message, () => {
    addMessage(`You: ${message}`);
  });
  msgInput.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const nickInput = room.querySelector("#name input");
  nick = nickInput.value;
  socket.emit("set_name", nick);
}

form.addEventListener("submit", handleRoomSubmit);
socket.on("welcome", (nick) => {
  addMessage(`${nick} Joined!`);
});
socket.on("bye", (nick) => {
  addMessage(`${nick} Left!`);
});
socket.on("new_message", (msg, nick) => {
  addMessage(`${nick}: ${msg}`);
});
