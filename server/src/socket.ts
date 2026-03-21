import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
// @ts-ignore - Bypassing strict rootDir check for shared Prisma client
import { prisma } from "./lib/prisma";

// Helper function to generate an infinite variety of vibrant colors
const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360); // 0 to 360 degrees on the color wheel
    // 80% saturation (vibrant), 45% lightness (dark enough to see white text on it)
    return `hsl(${hue}, 80%, 45%)`; 
};

export const setupSocket = (httpServer: HttpServer) => {
    const documentVersions = new Map<string, number>();
    const roomUser = new Map<string, any[]>();
    const documentSteps = new Map<string, any[]>();
    const documentMargins = new Map<string, { left: number, right: number }>();

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        },
        
        pingTimeout: 60000, // Wait 60s before closing dead connections
        pingInterval: 25000 // Check every 25s
    })

    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id}`);

        socket.on("join-document", async (documentId: string, userName: string, userId: string) => {
            try {
                // 1. Query database for the document AND its guest list (collaborators)
                const document = await prisma.document.findUnique({
                    where: { id: documentId },
                    include: {
                        collaborators: true 
                    }
                });

                // 2. If document doesn't exist, kick them out
                if (!document) {
                    console.log(`Access Denied: User ${userId} tried to join invalid room ${documentId}`);
                    socket.emit("access-denied", "Document not found.");
                    socket.disconnect();
                    return;
                }

                const isOwner = document.ownerId === userId;
                const isCollaborator = document.collaborators.some((collab: any) => collab.userId === userId);
                
                // Check if the document has the public flag set to true
                const isPublic = document.isPublic; 

                // If they are not the owner, not a collaborator, AND the document is restricted, kick them!
                if (!isOwner && !isCollaborator && !isPublic) {
                    console.log(`Security Kick: Unauthorized user ${userId} blocked from ${documentId}`);
                    socket.emit("access-denied", "You do not have permission to view this document.");
                    socket.disconnect();
                    return;
                }

                // Document exists AND they have permission, let them in
                socket.join(documentId);
                const color = generateRandomColor();
                
                const user = {
                    id: socket.id,
                    dbUserId: userId, // Keep track of their actual database ID
                    color: color,
                    name: userName || "Anonymous"
                };

                let userInRoom = roomUser.get(documentId) || [];
                userInRoom.push(user);
                roomUser.set(documentId, userInRoom);

                io.to(documentId).emit("presence-update", userInRoom);
                console.log(`👤 ${user.name} joined ${documentId} with color ${color}`);

            } catch (error) {
                console.error("Database error during join:", error);
                socket.emit("access-denied", "Server error verifying access.");
                socket.disconnect();
            }
        });

        socket.on("send-changes", (documentId: string, data: any) => {
            let version = documentVersions.get(documentId) || 0;
            
            version++;
            documentVersions.set(documentId, version);

            // Save the incoming steps to our Ledger
            let history = documentSteps.get(documentId) || [];
            history.push(...data); // Add the new steps to the end of the array
            documentSteps.set(documentId, history);

            socket.to(documentId).emit("receive-changes", data, version);
            
            console.log(`Room: ${documentId} | New Version: ${version}`);
        });

        socket.on("request-document", (documentId: string) => {
            const history = documentSteps.get(documentId) || [];
            socket.emit("load-document", history);

            const currentMargins = documentMargins.get(documentId);
            if (currentMargins) {
                socket.emit("receive-ruler", currentMargins);
            }
        });

        // Fast-pass relay for live cursor movements
        socket.on("cursor-move", (documentId: string, cursorData: any) => {
            // Instantly bounce the cursor position to everyone else in the room
            socket.to(documentId).emit("receive-cursor", cursorData);
        });

        socket.on("ruler-move", (documentId: string, margins: { left: number, right: number }) => {
            documentMargins.set(documentId, margins);
            socket.to(documentId).emit("receive-ruler", margins);
        });

        socket.on("save-document", async (documentId: string, content: string) => {
            try {
                await prisma.document.update({
                    where: { id: documentId },
                    // Convert the string to a Buffer for the Postgres Bytes column
                    data: { content: Buffer.from(content, 'utf-8') } 
                });

                console.log(`Successfully saved snapshot for ${documentId} to PostgreSQL`);
            } catch (error) {
                console.error("Failed to save to database:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);

            roomUser.forEach((user, documentId) => {
                const updatedUsers = user.filter((u) => u.id != socket.id)

                if(updatedUsers.length === 0) {
                    roomUser.delete(documentId)
                } else {
                    roomUser.set(documentId, updatedUsers)
                    io.to(documentId).emit("presence-update", updatedUsers)
                }
            })
        })
    })
}