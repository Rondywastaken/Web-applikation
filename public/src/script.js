const socket = io("http://localhost:3000", { transports : ["websocket"] });
const messageForm = document.getElementById("send-container");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");

var getName = document.getElementById("hello-text").dataset.name;

appendMessage("Du tilsluttede dig samtalen");
socket.emit("new-user", getName);

socket.on("chat-message", data => {
    appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", getName => {
    appendMessage(`${getName} tilsluttede sig samtalen`);
});

socket.on("user-disconnected", getName => {
    appendMessage(`${getName} frakoblede sig samtalen`);
});

messageForm.addEventListener("submit", e => {
    e.preventDefault()
    const message = messageInput.value;
    appendMessage(`Dig: ${message}`);
    socket.emit("send-chat-message", message);
    messageInput.value = "";
});

function appendMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}