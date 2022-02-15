import { socket } from "./main.js";

export default class Cell {
    constructor(x, y, color, game) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.checker = null;
        this.game = game;

        this.checkerCell = document.createElement('div');
        this.checkerCell.classList.add('checker-field__cell', 'checker-cell');
        this.checkerCell.style.backgroundColor = this.color;

        this.cashCell = null;
    }
    cellClickForMoving = () => {
        socket.emit("get moving checker", { gameID: this.game.gameID,
                                       coordFrom: {
                                        y: this.cashCell.y, x: this.cashCell.x },
                                       coordTo: {
                                        y: this.y, x: this.x
                                      }});
        this.cashCell = null;
    };
    cellClickForEating = () => {
        socket.emit("remove eating-checkers", { gameID: this.game.gameID, coordTo: {y : this.y, x: this.x }});
        socket.emit("get moving checker", { gameID: this.game.gameID,
            coordFrom: {
             y: this.cashCell.y, x: this.cashCell.x },
            coordTo: {
             y: this.y, x: this.x
           }});
        this.cashCell = null;
    };
    activeCell(){
        this.game.clearActive();
        if (!this.checkerCell.classList.contains('checker--active')) {
            this.checkerCell.classList.add('checker--active');
            this.game.activeEmptyCell(this.y, this.x);
        }
    }
    addEventEat(cell){
        this.cashCell = cell;
        this.checkerCell.addEventListener('click', this.cellClickForEating);
    }
    addEventMove(cell){
        this.cashCell = cell;
        this.checkerCell.addEventListener('click', this.cellClickForMoving);
    }
    setChecker(checker) {
        this.checker = checker;
        this.checker.cell = this;
        this.checkerCell.append(checker.checker);
    }
    removeChecker() {
        this.checker.cell = null;
        let checker = this.checker;
        this.checker = null;
        this.checkerCell.innerHTML = "";
        return checker;
    }
    hasChecker() {
        return this.checker !== null;
    }
}

