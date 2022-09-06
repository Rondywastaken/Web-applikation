const socket = io("http://localhost:3000", { transports : ["websocket"] });

socket.on("chat-message", data => {
    console.log(data);
});

