import Player from './Player.js';
import Cell from './Cell.js';
import Checker from './Checker.js';
import { socket } from './main.js'

class Game {
    arrCells = [];

    constructor(gameID) {
        this.gameID = gameID;
        this.checkerField = document.createElement('div');
        this.checkerField.classList.add('checker-field', 'game-container__field');
        this.gameContainer = document.querySelector(".game-container__info");
        this.nameOfActivePlayerLabel = document.querySelector('.info-active-player__name');
        this.checkerChat = document.createElement('div');
        this.checkerChat.classList.add('game-container__chat');
        this.gameContainer = document.querySelector(".game-container");
        if (this.gameContainer) {
            this.gameContainer.append(this.checkerField, this.checkerChat);
            this.ro = new ResizeObserver(blocks => {
                blocks.forEach(el => {
                    const width = el.borderBoxSize ? el.borderBoxSize[0].inlineSize : el.contentRect.width;
                    el.target.style.height = width + 'px';
                })
            });
            this.ro.observe(this.checkerField);
            this.gameContainer.classList.add('show');
        }
        this.init();
    }
    async init() {
        await this.initPlayers();
    }
    async initPlayers() {
        socket.emit('get players', this.gameID);
        socket.on('set players', data => {
            this.player1 = new Player(data[0].name, data[0].rows, data[0].color, data[0].status, data[0].active, this);
            this.player2 = new Player(data[1].name, data[1].rows, data[1].color, data[1].status, data[1].active, this);
            this.setField();
            this.changeNameIntoLabel();
        });
    }
    setField() {
        for (let i = 0; i < 8; i++) {
            this.arrCells.push([]);
            for (let j = 0; j < 8; j++) {
                let cell = null;
                if (i % 2 === 0) {
                    if (j % 2 === 0) {
                        cell = new Cell(j, i, '#d9d9d7', this);
                    }
                    else {
                        cell = new Cell(j, i, '#5e5e5e', this);
                        this.setCheckersToField(i, cell);
                    }
                } else {
                    if (j % 2 !== 0) {
                        cell = new Cell(j, i, '#d9d9d7', this);
                    }
                    else {
                        cell = new Cell(j, i, '#5e5e5e', this);
                        this.setCheckersToField(i, cell);
                    }
                }
                this.arrCells[i].push(cell);
                this.checkerField.append(cell.checkerCell);
            }
        }
    }
    setCheckersToField(y, checkerCell) {
        for (let player of [this.player1, this.player2]) {
            if (player.rows.includes(y)) {
                const checker = new Checker(player.color, player, checkerCell);
                player.pushChecker(checker);
                checkerCell.setChecker(checker);
            }
        }
    }
    activeEmptyCell(y, x) {
        socket.emit("get active empty cell", {gameID: this.gameID, y, x});
    }
    getActivePlayer(){
        return this.player1.active ? this.player1 : this.player2;
    }
    getPassivePlayer(){
        return this.player1.active ? this.player2 : this.player1;
    }
    clearActive(){
        for (let i = 0; i < 8; i++) {
            if (i % 2 === 0)
                for (let j = 1; j < 8; j+=2)
                    this.clearChecker(this.arrCells[i][j]);
  
            if (i % 2 === 1)
                for (let j = 0; j < 7; j+=2)
                    this.clearChecker(this.arrCells[i][j]);
        }
    }
    clearChecker(cell){
        if (cell.checkerCell.classList.contains('checker--move')) {
            cell.checkerCell.classList.remove('checker--move');
        }
        cell.checkerCell.removeEventListener('click', cell.cellClickForMoving);
        cell.checkerCell.removeEventListener('click', cell.cellClickForEating);
        cell.checkerCell.classList.remove('checker--active');
    }
    removeChecker(coordFrom){
        return this.arrCells[coordFrom.y][coordFrom.x].removeChecker();
    }
    pushChecker(coordTo, checker){
        this.arrCells[coordTo.y][coordTo.x].setChecker(checker);
    }
    moveCheckerOfPlayer(data){
        if (this.player1.active) this.player1.moveChecker(data);
        if (this.player2.active) this.player2.moveChecker(data);
    }
    nextGameTurn(actives){
        this.player1.active = actives.player;
        this.player2.active = actives.rival;
        this.player1.changeEventActive();
        this.player2.changeEventActive();
        this.changeNameIntoLabel();
    }
    changeNameIntoLabel(){
        const activePlayer = this.getActivePlayer();
        if (activePlayer && this.nameOfActivePlayerLabel) this.nameOfActivePlayerLabel.innerText = activePlayer.name ?? '-';
    }
    eatCheckers(coordArr){
        this.getActivePlayer().eatChecker(coordArr);
    }
    getCheckerByCoord(coord){
        return this.arrCells[coord.y][coord.x].checker
    }
}

export default Game;