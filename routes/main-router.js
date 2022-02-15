import express from 'express';
import { getHomePage, createGamePage, errorServer, notFoundPage } from '../controllers/connect-controller.js';

const mainRouter = express.Router();

mainRouter.get('/', getHomePage);
mainRouter.post('/', createGamePage);
mainRouter.use(errorServer)
mainRouter.use('/game', notFoundPage);

export default mainRouter;
