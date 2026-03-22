import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { setupSocket } from './socket';

dotenv.config(); 

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "https://document-editor-nine.vercel.app",
    methods: ["GET", "POST"]
}));

app.get("/", (req, res) => {
    res.send("Document Editor Socket Server is Live and Routing Traffic!");
});

const httpServer = createServer(app);

setupSocket(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});