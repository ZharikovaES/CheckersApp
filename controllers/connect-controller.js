import { URL } from '../config.js';
import { generateUUID } from '../utils.js'
import { dataCash,
    existsPlayersByLink,
    addNewPlayer,
    createGame,
    getPlayersByID,
    getGameByID,
    getActiveCell,
    getCoordMovingChecker,
    isWalkingNow,
    getNextGameTurn,
    getCoordEatingChecker,
    checkExistsRoomByPlayerSocketID,
    getPlayerBySocketID,
    removeGameByGameID,
    getRivalPlayer,
    getWinner,
    checkCountOfMoves,
    createTimer,
    getGameIDBySocketID,
    removePlayerBySocketID
} from '../services/games-service.js'
import mainRouter from '../routes/main-router.js';
import { io } from '../index.js';

const LINK_LIFETIME = 60 * 1000;
const MAX_LENGTH_VALUE_OF_INPUT = 25;

export const getHomePage = (req, res) => {
    res.render('index', { title: "Шашки" });
};

export const createGamePage = (req, res) => {
    let gameID = null;
    try{
        if (typeof req.body.username === "string")
            if (req.body.username.length > MAX_LENGTH_VALUE_OF_INPUT || !req.body.username.trim().length) res.redirect('/');
            else {
                gameID = generateUUID();
                let newLink = URL + '/game/' + gameID;
        
                let index = dataCash.indexOf(el => el.link === newLink);
                if (index === -1){
                    dataCash.push({gameID, link: newLink, username: req.body.username.trim()});
                } else {
                    dataCash[index].username = req.body.username.trim();
                }
                mainRouter.get('/game/' + gameID, (req, res) => {
                    res.render('multiplayer-mode', { title: "Шашки. Игра с другом", link: newLink });
                });
                setTimeout(e => {
                    mainRouter.stack = mainRouter.stack.filter(el => {
                        if (!el.route || !el.route.path) return true;
                        return el.route.path !== "/game/" + gameID;
                    });  
                }, LINK_LIFETIME);
                res.redirect('/game/' + gameID);        
            }
        else res.redirect('/');
    } catch(error) {
        console.log(error.toString());
        if (gameID) removeGameByGameID(gameID);
        res.status(502);
    }
}
export const errorServer = (err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(502);
}
export const notFoundPage = (req, res, next) => {
    if (req.originalUrl.includes("/game") && mainRouter.stack.find(el => !el.route || !el.route.path ? false : el.route.path === req.originalUrl))
        next();
    else res.sendStatus(404);
}
export const interruptedGame = (game, text) =>{
    io.to(game.gameID).emit("game interrupted", { text });
    removeGameByGameID(game.gameID);    
}
export const connectToRoom = (socket, data) => {
    try{
        let dataEl = dataCash.filter(el => el.link === data.link)[0];

        if (existsPlayersByLink(data.link).length === 0 && !checkExistsRoomByPlayerSocketID(io.sockets, socket.id)) {
            socket.join(dataEl.gameID);
            addNewPlayer(dataEl.username, data.link, socket.id);
            socket.emit("copy link", {link: data.link});
        }
        else if (existsPlayersByLink(data.link).length === 1 && !checkExistsRoomByPlayerSocketID(io.sockets, socket.id)){
            socket.emit("get username");
        }
    } catch(error) {
        stopGame(error, socket);
    }
}
export const completingConnectionToRoom = (socket, data) => {
    try{
        if (data.username.length > MAX_LENGTH_VALUE_OF_INPUT || !data.username.trim().length) socket.emit("incorrect entered data");
        else {
            let dataEl = dataCash.filter(el => el.link === data.link)[0];
            addNewPlayer(data.username, data.link, socket.id);
            let newGame = createGame(dataEl.gameID, data.link);
            socket.join(dataEl.gameID);
            io.to(dataEl.gameID).emit("start game", dataEl.gameID);
            let index = dataCash.indexOf(el => el.link === data.link);
            dataCash.splice(index, 1);
            createTimer(newGame, interruptedGame);
            mainRouter.stack = mainRouter.stack.filter(el => {
                if (!el.route || !el.route.path) return true;
                return el.route.path !== "/game/" + dataEl.gameID;
            });    
        }
    } catch(error) {
        stopGame(error, socket);
    }
}
export const getPlayers = (socket, gameID) => {
    try{
        let game = getGameByID(gameID);
        let players = getPlayersByID(gameID);
        if (game.player1.socketID === socket.id){
            socket.emit('set players', players[0]);
        }
        else if (game.player2.socketID === socket.id)
            socket.emit('set players', players[1]);
    } catch(error) {
        stopGame(error, socket);
    }
}
export const getActiveEmptyCell = (socket, data) => {
    try{
        if (isWalkingNow(socket.id, data.gameID)) {
            let coord = getActiveCell(data);
            socket.emit("set active empty cell", coord);
        }
    } catch(error) {
        stopGame(error, socket);
    }
}
export const getMovingChecker = (socket, data) => {
    try{
        if (isWalkingNow(socket.id, data.gameID)) {
            let game = getGameByID(data.gameID);
            let { coordArr, isKing } = getCoordMovingChecker(data);
            let activesArr = getNextGameTurn(data.gameID);
            io.to(game.player1.socketID).emit("set moving checker", { coord: coordArr[0], isKing, actives: activesArr[0] });
            io.to(game.player2.socketID).emit("set moving checker", { coord: coordArr[1], isKing, actives: activesArr[1] });
            createTimer(game, interruptedGame);
            if (checkCountOfMoves(game)) interruptedGame(game, "Вы сделали больше 40 ходов. Игра завершена ничьей. Начните игру заново.");
        }
    } catch(error) {
        stopGame(error, socket);
    }
}
export const removeEatingCheckers = (socket, data) => {
    try{
        if (isWalkingNow(socket.id, data.gameID)) {
            let game = getGameByID(data.gameID);

            let coordArr = getCoordEatingChecker(data.gameID, data.coordTo);
            
            io.to(game.player1.socketID).emit("get eating-checkers", coordArr[0]);
            io.to(game.player2.socketID).emit("get eating-checkers", coordArr[1]);

            let winner = getWinner(game);
            if (winner) {
                console.log(io.sockets.adapter.rooms);
                console.log(game.gameID);
                io.to(game.gameID).emit("game over", { text: "Игра завершена победой: " + winner.name} );
                removeGameByGameID(game.gameID);
            }
        }
    } catch(error) {
        stopGame(error, socket);
    }
}
export const disconnect = socket => {
    try{
        let currentPlayer = getPlayerBySocketID(socket.id);
        let rivalPlayer = getRivalPlayer(socket.id);
        if (rivalPlayer) {
            io.to(rivalPlayer.socketID).emit("game finished", {text: "К сожалению, Ваш соперник покинул игру... Начните игру заново."});
            removeGameByGameID(rivalPlayer.game.gameID);
        }
        else if (currentPlayer){
            removePlayerBySocketID(socket.id);
        }
    } catch(error) {
        console.log(error.toString());
    }
}
const stopGame = (error, socket) => {
    let id = getGameIDBySocketID(socket.id);
    if (id) io.to(id).emit("game error", { text: "Что-то пошло не так... Начните игру заново."} );
    else io.to(socket.id).emit("game error", { text: "Что-то пошло не так... Начните игру заново."} );
    if (id) removeGameByGameID(id);
    else {
        let rivalPlayer = getRivalPlayer(socket.id);
        if (socket.id) removePlayerBySocketID(socket.id);
        if (rivalPlayer) removePlayerBySocketID(rivalPlayer.socketID);
    }
}
