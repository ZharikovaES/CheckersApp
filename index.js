'use strict';

import express from 'express';
import path from 'path';
import { Server } from 'socket.io';

import mainRouter from './routes/main-router.js';
import { PORT } from './config.js';
import { nextTick } from 'process';
import { connection } from './controllers/socket-controllers/game-events.js';

const __dirname = path.resolve();
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'templates'));
app.use(express.static((path.resolve(__dirname, "static"))));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', mainRouter);

const server = app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
});
export const io = new Server(server);
io.on('connection', connection);