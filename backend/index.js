const port = process.env.PORT || 8000;

const io = require('socket.io')(port, {
    cors: {
        origin: '*'
    }
});

const users = {};

io.on('connection', (socket) => {
    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('joined', {user: name, id: socket.id, own: false});
    });

    socket.on('send', (message) => {
        io.emit('recieved', {message: message, user: users[socket.id], id: socket.id, own: false});
    });
});

console.log(`Listening at http://localhost:${port}`);
