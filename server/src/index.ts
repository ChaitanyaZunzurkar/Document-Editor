import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 

import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);

setupSocket(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});