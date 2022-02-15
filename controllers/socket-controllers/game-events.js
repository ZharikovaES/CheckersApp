import { connectToRoom, disconnect, getActiveEmptyCell, getMovingChecker, getPlayers, completingConnectionToRoom, removeEatingCheckers } from '../connect-controller.js';

export const connection = socket => {        
    socket.on("connect to room", data => {
        connectToRoom(socket, data);
    });
    socket.on("completing connect to room", data => {
        completingConnectionToRoom(socket, data);
    });
    socket.on("get players", data => {
        getPlayers(socket, data);
    });
    socket.on("get active empty cell", data => {
        getActiveEmptyCell(socket, data);
    });
    socket.on("get moving checker", data => {
        getMovingChecker(socket, data);
    });
    socket.on("remove eating-checkers", data => {
        removeEatingCheckers(socket, data);
    });
    socket.on("disconnect", () => {
        disconnect(socket);
    });
}

