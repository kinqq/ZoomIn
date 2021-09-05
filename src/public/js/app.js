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
  socket.emit("count_room", roomName);
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function changeRoomTitle(title, count = 1) {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${title} (${count})`;
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
socket.on("welcome", (nick, userCount) => {
  addMessage(`${nick} Joined!`);
  changeRoomTitle(roomName, userCount);
});
socket.on("bye", (nick, userCount) => {
  addMessage(`${nick} Left!`);
  changeRoomTitle(roomName, userCount);
});
socket.on("new_message", (msg, nick) => {
  addMessage(`${nick}: ${msg}`);
});
socket.on("room_change", (rooms) => {
  const ul = welcome.querySelector("ul");
  ul.innerHTML = "";
  if (!rooms.length) return;
  rooms.forEach((room) => {
    const button = document.createElement("button");
    button.innerText = room;
    button.addEventListener("click", () => {
      welcome.querySelector("input").value = room;
      welcome.querySelector("button").click();
    });
    ul.appendChild(button);
  });
  socket.on("count_room", (countUsers) =>
    changeRoomTitle(roomName, countUsers)
  );
});
