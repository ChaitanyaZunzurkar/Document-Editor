import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

// Helper function to generate a random vibrant color
const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360); // Pick a random color around the color wheel
    return `hsl(${hue}, 80%, 45%)`; // 80% Saturation (vibrant), 45% Lightness (readable)
};

export const setupSocket = (httpServer: HttpServer) => {
    const documentVersions = new Map<string, number>();
    const roomUser = new Map<string, any[]>();

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id}`);

        socket.on("join-document", (documentId: string, userName: string) => {
            socket.join(documentId);

            // 1. Generate the dynamic color here
            const color = generateRandomColor();
            
            const user = {
                id: socket.id,
                color: color,
                name: userName || "Anonymous"
            };

            let userInRoom = roomUser.get(documentId) || [];
            userInRoom.push(user);
            roomUser.set(documentId, userInRoom);

            io.to(documentId).emit("presence-update", userInRoom);

            console.log(`${user.name} joined ${documentId} with color ${color}`);
        });

        socket.on("send-changes", (documentId: string, data: any) => {
            let version = documentVersions.get(documentId) || 0;
            
            version++;
            documentVersions.set(documentId, version);

            socket.to(documentId).emit("receive-changes", data, version);
            
            console.log(`Room: ${documentId} | New Version: ${version}`);
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);

            roomUser.forEach((user, documentId) => {
                const updatedUsers = user.filter((u) => u.id != socket.id);

                if(updatedUsers.length === 0) {
                    roomUser.delete(documentId);
                } else {
                    roomUser.set(documentId, updatedUsers);
                    io.to(documentId).emit("presence-update", updatedUsers);
                }
            });
        });
    });
};