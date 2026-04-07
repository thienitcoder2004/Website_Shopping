const { Server } = require("socket.io");

let io;

exports.initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("Admin connected:", socket.id);
    });

    return io;
};

exports.getIO = () => io;