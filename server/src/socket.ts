import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const setupSocket = (httpServer: HttpServer) => {
    const documentVersions = new Map<string, number>();

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        },
        
        pingTimeout: 60000, // Wait 60s before closing dead connections
        pingInterval: 25000 // Check every 25s
    })

    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id}`);

        socket.on("join-document", (documentId: string) => {
            socket.join(documentId)
            console.log(`User ${socket.id} entered Room: ${documentId}`);
        })

        socket.on("send-changes", (documentId: string, data: any) => {
            let version = documentVersions.get(documentId) || 0;
            
            version++;
            documentVersions.set(documentId, version);

            socket.to(documentId).emit("receive-changes", data, version);
            
            console.log(`📄 Room: ${documentId} | New Version: ${version}`);
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);
        })
    })
}