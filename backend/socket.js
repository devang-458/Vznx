const { Server } = require("socket.io");

let io;
let users = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        process.env.CLIENT_URL
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("register", (userId) => {
            socket.userId = userId;
            users[userId] = socket.id;
            console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
        });

        socket.on("sendMessage", ({ senderId, receiverId, content }) => {
            const receiverSocketId = users[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", {
                    sender: senderId,
                    content: content,
                    createdAt: new Date()
                });
            }
        });

        socket.on("disconnect", () => {
            for (const userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    break;
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const sendMessageToUser = (receiverId, senderId, content, createdAt) => {
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
        const io = getIo();
        io.to(receiverSocketId).emit('receiveMessage', {
            sender: senderId,
            content: content,
            createdAt: createdAt
        });
    }
};

module.exports = { initSocket, getIo, sendMessageToUser };
