import { generateUUID, filterNoRepeatResult } from '../../utils.js'

export default class Player {
    static WHITE = "#cfcfcf";
    static BLACK = "#1a1a1a";

    arrCheckers = [];
    gameURL = "";

    constructor(name, link, socketID) {
        this.name = name;
        this.id = generateUUID();
        this.gameURL = link;
        this.socketID = socketID;
    }
    set gameURL(gameURL){
        if (typeof(gameURL) === "string") this.gameURL = gameURL;
    }
    init(rows, active){
        this.rows = rows;
        this.active = active;
        if (active) this.color = Player.WHITE;
        else this.color = Player.BLACK;
    }
    isWinner(){
        return this.arrCheckers.length === 0;
    }
    getParams() {
        return {
            rows : this.rows,
            color : this.color,
            active : this.active
            }
    }
    pushChecker(checker) {
        this.arrCheckers.push(checker);
    }
    filterMoves(){
        if (this.cash.treeOfMoves.length)
            this.cash.treeOfMoves.forEach((el, i) => {
                let currentIndex = this.getIndexByCoordTo(el[el.length - 1]);
                if (currentIndex !== i)
                    if (this.cash.treeOfMoves[currentIndex].length > this.cash.treeOfMoves[i].length || this.cash.treeOfMoves[currentIndex].length === this.cash.treeOfMoves[i].length && this.cash.treeOfMoves[currentIndex][this.cash.treeOfMoves[currentIndex].length - 1].isKing)
                        this.cash.treeOfMoves[i] = this.cash.treeOfMoves[currentIndex];
                    else if (this.cash.treeOfMoves[currentIndex].length < this.cash.treeOfMoves[i].length || this.cash.treeOfMoves[currentIndex].length === this.cash.treeOfMoves[i].length && this.cash.treeOfMoves[i][this.cash.treeOfMoves[i].length - 1].isKing)
                        this.cash.treeOfMoves[currentIndex] = this.cash.treeOfMoves[i];
            });
    }
    getIndexByCoordTo(el){
        if (el)
            for (let i = 0; i < this.cash.treeOfMoves.length; i++){
                if (this.cash.treeOfMoves[i][this.cash.treeOfMoves[i].length - 1].move.y === el.move.y && this.cash.treeOfMoves[i][this.cash.treeOfMoves[i].length - 1].move.x === el.move.x)
                    return i;
            }
    }
    getCoordEatingCheckerToCoordTo(y, x){
        let coordRival = [];
        if (this.cash) {
            this.cash.checker.changeToKing();
            if (this.cash.treeOfMoves)
                if (this.cash.treeOfMoves.length > 0)
                    for (let i = 0; i < this.cash.treeOfMoves.length; i++)
                        if (this.cash.treeOfMoves[i][this.cash.treeOfMoves[i].length - 1].move.y === y && this.cash.treeOfMoves[i][this.cash.treeOfMoves[i].length - 1].move.x === x) {
                            this.cash.treeOfMoves[i].forEach(el => {
                                if (el.rival) coordRival.push(el.rival);
                            });
                            break;
                        }
            }
        return filterNoRepeatResult(coordRival);
    }
    removeChecker(removingChecker){
        let owner = null;
        if (removingChecker) owner = removingChecker.owner;
        owner.defeat(removingChecker);
    }
    eatCheckers(coordArr){
        this.game.removeCheckers(coordArr);
    }
    defeat(checker){
        if (checker && checker.cell) this.arrCheckers = this.arrCheckers.filter((el) => !(el.cell.y === checker.cell.y && el.cell.x === checker.cell.x));
    }
    changeStatusOfChecker(y, checker){
        return (y === 0 || y === 7) && !this.rows.includes(y) ? checker.changeToKing() : false;
    }
    checkStatusOfChecker(y){
        return (y === 0 || y === 7) && !this.rows.includes(y);
    }
}
