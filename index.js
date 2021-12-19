const path = require("path");
const http = require("http");
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "/public");

app.use(express.static(publicDirPath));


io.on("connection", (socket) => {
    console.log('client connected 🎉', socket.id);

    socket.on('file-metadata', metadata => {
        socket.broadcast.emit('file-metadata', metadata)
    })

    socket.on('send-file', metadata => {
        socket.broadcast.emit('file-metadata', metadata)
    })

    socket.on('file-chunk', chunk => {
        socket.broadcast.emit('file-chunk', chunk)
    })

    socket.on('disconnect', () => {
        console.log('client left the socket 😢', socket.id);
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
})