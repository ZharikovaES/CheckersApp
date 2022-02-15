import Game from './game_logic/Game.js';
import Player from './game_logic/Player.js';

const TURN_WAITING_TIME = 5 * 60 * 1000;

let players = new Array();
let games = new Array();
export const dataCash = new Array();

export const addNewPlayer = (username, link, socketID) => {
    try{
        players.push(new Player(username, link, socketID));
    } catch(e) {
        console.log(e.toString());
    }
}
export const getGameByID = gameID => {
    return games.find(el => el.gameID === gameID);
}
export const existsPlayerBySocketID = socketID => {
    let player = players.find((el) => el.socketID === socketID);
    if (player) return true;
    else return false;
}
export const existsPlayersByLink = link => {
    let playersArr = players.filter((el) => el.gameURL === link);
    return playersArr;
}
export const getGameIDByLink = (sockets, link) => {
    let room;
    let player = getPlayerByLink(link);
    let roomsIter = sockets.adapter.sids.get(player.socketID)[Symbol.iterator]();
    if (player) room = roomsIter.next().value;
    return room;
}
export const getGameIDBySocketID = socketID => {
    let player = getPlayerBySocketID(socketID);
    return player ? player.game.gameID : null;
}
export const createGame = (gameID, link) => {
    let playersArr = existsPlayersByLink(link);
    let newGame = new Game(gameID, ...playersArr, link);
    games.push(newGame);
    return newGame;
}
export const getPlayersByID = gameID => {
    let game = getGameByID(gameID);
    return game.getParamsOfPlayers();
}
export const getPlayerByLink = link => {
    let player = players.find((el) => el.gameURL === link);
    return player;
}
export const getPlayerBySocketID = socketID => {
    let player = players.find(el => el.socketID === socketID);
    return player;
}
export const checkExistsRoomByPlayerSocketID = (sockets, socketID) => {
    let player = getPlayerBySocketID(socketID);
    let clientsNow;
    if (player) clientsNow = sockets.clients(player.gameID);
    else return false;
    return clientsNow.length > 0;
}
export const getActiveCell = (data) => {
    let game = getGameByID(data.gameID);
    let result = {};
    result.coordTo = game.getActiveCell(data.y, data.x);
    result.coordFrom = { y: data.y, x: data.x };
    return result;
}
export const getCoordMovingChecker = data => {
    let game = getGameByID(data.gameID);
    let result =  game.getCoordMovingChecker(data.coordFrom, data.coordTo);
    return result;
}
export const getNextGameTurn = gameID => {
    let game = getGameByID(gameID);
    return game.nextGameTurn();
}
export const isWalkingNow = (socketID, gameID) => {
    let game = getGameByID(gameID);
    if (game.player1.active && game.player1.socketID === socketID || game.player2.active && game.player2.socketID === socketID) return true;
    return false;
}
export const getCoordEatingChecker = (gameID, coordTo) => {
    let game = getGameByID(gameID);
    let result = game.getCoordEatingChecker(coordTo);
    return result;
}
export const getRivalPlayer = socketID => {
    let player1 = getPlayerBySocketID(socketID);
    let game = player1 ? player1.game : null;
    if (game) return player1.socketID === game.player1.socketID ? game.player2 : game.player1;
    return null;
}
export const removePlayerBySocketID = socketID => {
    players = players.filter(el => el.socketID !==socketID);
}
export const removeGameByGameID = gameID => {
    let game = games.find(el => el.gameID === gameID);
    if (game) {
        players = players.filter(el => el.id !== game.player1.id && el.id !== game.player2.id);
        clearTimeout(game.timer);
    }
    games = games.filter(el => el.gameID !== gameID);
    return game ?? null;
}
export const getWinner = currentGame => {
    return currentGame.getWinner();
}
export const checkCountOfMoves = currentGame => {
    return currentGame.checkCountOfMoves();
}
export const createTimer = (currentGame, interruptedGame) => {
    currentGame.createTimer(TURN_WAITING_TIME, interruptedGame);
}

