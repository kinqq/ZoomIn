const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function onServerReceive(data) {
    console.log(`Server Received: ${data}`);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = welcome.querySelector("input");
    socket.emit("enter_room", { payload: input.value }, onServerReceive);
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
