import { getRandomInt, filterNoRepeatResult } from '../../utils.js'
import Cell from './Cell.js';
import Checker from './Checker.js';

export default class Game {
    gameURL = "";
    arrCells = [];
    countOfMoves = 0;
    timer = null;

    constructor(gameID, player1, player2, gameURL) {
        this.gameID = gameID;
        this.player1 = player1;
        this.player2 = player2;
        this.gameURL = gameURL;

        this.player1.game = this;
        this.player2.game = this;

        this.init();
    }
    init() {
        this.initPlayers();
        this.setField();
    }
    getParamsOfPlayers() {
        return [
            [{name: this.player1.name, color: this.player1.color, rows: [5, 6, 7], status: 'player', active: this.player1.active}, {name: this.player2.name, color: this.player2.color, rows: [0, 1, 2], status: 'rival', active: this.player2.active }],
            [{name: this.player2.name, color: this.player2.color, rows: [5, 6, 7], status: 'player', active: this.player2.active }, {name: this.player1.name, color: this.player1.color, rows: [0, 1, 2], status: 'rival', active: this.player1.active}]
        ];
    }
    createTimer(time, interruptedGame){
        if (this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(interruptedGame, time, this, "Превышен лимит ожидания хода. Начните игру заново.");
    }
    initPlayers(){
        const random = getRandomInt(2);
        let playerParam, rivalParam;
        if (random === 0) {
            playerParam = { rows: [0, 1, 2], active: true};
            rivalParam = { rows: [5, 6, 7], active: false};
        } else {
            playerParam = { rows: [0, 1, 2], active: false};
            rivalParam = { rows: [5, 6, 7], active: true};
        }
        this.player1.init(playerParam.rows, playerParam.active);
        this.player2.init(rivalParam.rows, rivalParam.active);
    }
    checkCountOfMoves(){
        return this.countOfMoves > 60;
    }
    setField() {
        for (let i = 0; i < 8; i++) {
            this.arrCells.push([]);
            for (let j = 0; j < 8; j++) {
                let cell = null;
                if (i % 2 === 0) {
                    if (j % 2 === 0)
                        cell = new Cell(j, i);
                    else {
                        cell = new Cell(j, i);
                        this.setCheckersToField(i, cell);
                    }
                } else {
                    if (j % 2 !== 0)
                        cell = new Cell(j, i);
                    else {
                        cell = new Cell(j, i);
                        this.setCheckersToField(i, cell);
                    }
                }
                this.arrCells[i].push(cell);
            }
        }
    }
    setCheckersToField(y, checkerCell) {
        for (const player of [this.player1, this.player2])
            if (player.rows.includes(y)) {
                const checker = new Checker(player, checkerCell);
                player.pushChecker(checker);
                checkerCell.setChecker(checker);
            }
    }
    getCheckerByCoord(coord){
        return this.arrCells[coord.y][coord.x].checker
    }
    removeCheckers(coordArr){
        for (let i = 0; i < coordArr.length; i++){
            let currentCell = this.arrCells[coordArr[i].y][coordArr[i].x];
            if (currentCell.hasChecker()){
                this.getPassivePlayer().defeat(currentCell.checker);
                currentCell.removeChecker();
            }
        }
    }
    nextGameTurn(){
        let newPlayerActive = [];
        if (this.player1.active) {
            newPlayerActive.push({player: false, rival: true});
            newPlayerActive.push({player: true, rival: false});
        } else {
            newPlayerActive.push({player: true, rival: false});
            newPlayerActive.push({player: false, rival: true});
        }
        this.player1.active = !this.player1.active;
        this.player2.active = !this.player2.active;
        return newPlayerActive;
    }
    getActiveCell(y, x){
        if (this.player1.active) {
            let reverseCoord = this.reverseCoord({y, x})[0];
            let searchCoord = this.reverseCoord(...this.searchCell(reverseCoord.y, reverseCoord.x, this.player1, true));
            return searchCoord;
        }
        if (this.player2.active) {
            let searchCoord = this.searchCell(y, x, this.player2, false);
            return searchCoord;
        }
    }
    getActivePlayer(){
        return this.player1.active ? this.player1 : this.player2;
    }
    getPassivePlayer(){
        return this.player1.active ? this.player2 : this.player1;
    }
    getWinner(){
        return this.player1.isWinner() ? this.player1 : this.player2.isWinner() ? this.player2 : null;
    }
    reverseCoord(...arr) {
        let newArr = JSON.parse(JSON.stringify(arr))
        newArr.forEach(function(el){
            el.y = 7 - el.y;
            el.x = 7 - el.x;
        });
        return newArr;
    }
    searchCell(y, x, player, flag){
        let result = [];
        let isKing = this.arrCells[y][x].checker.isKing;
        player.cash = { checker: this.arrCells[y][x].checker, treeOfMoves: [] };
        let rangeArr = this.getActiveMovesOfKing(y, x, y, x, isKing);
        let noUseIndex = [];
        let next = true;

        for (let el of rangeArr)
        for (let i of el[0])
            for(let j of el[1]) {
                noUseIndex.forEach((element) => {
                    if (el[0].indexOf(i) === element.y && el[1].indexOf(j) === element.x) next = false;
                });
                if (next) {
                    let arrCash = [];
                    if (i >= 0 && i <= 7 && j >= 0 && j <= 7 && i !== null && j !== null) {
                        if (!this.arrCells[i][j].hasChecker() ) {
                            if ((i > y && flag || i < y && !flag) && !isKing || isKing) {
                                let newIsKing = isKing;
                                if (!isKing) newIsKing = player.checkStatusOfChecker(i);
                                result.push({ y: i, x: j, eating: false });
                                arrCash.push({ move: {y: i, x: j}, rival: null, isKing: newIsKing });
                                let copyArrCash = arrCash.slice();
                                player.cash.treeOfMoves.push(copyArrCash);
                            }
                        } else {
                            if (!this.arrCells[i][j].checker.owner.active) {
                                let rangeArrCurrent = this.getActiveEatingOfKing(y, x, i, j, isKing, -1, -1);
                                
                                for (let el of rangeArrCurrent) {
                                    let iCurrent = el[0];
                                    let jCurrent = el[1];
                                    if (jCurrent >= 0 && jCurrent <= 7 && iCurrent >= 0 && iCurrent <= 7) {
                                        if (!this.arrCells[iCurrent][jCurrent].hasChecker()) {
                                            let newIsKing = isKing;
                                            if (!isKing) newIsKing = player.checkStatusOfChecker(iCurrent);
                                            let copyArrCash = arrCash.slice();
                                            copyArrCash.push({ move: {y: iCurrent, x: jCurrent}, rival: {y: i, x: j}, isKing: newIsKing });
                                            result.push({ y: iCurrent, x: jCurrent, eating: true });

                                            this.searchMove(jCurrent, iCurrent, x, y, x, y, player, result, copyArrCash, newIsKing);
                                            player.cash.treeOfMoves.push(copyArrCash);
                                        }
                                    }
                                }
                            }
                            noUseIndex.push({ y: el[0].indexOf(i), x: el[1].indexOf(j) });
                        }
                    }
                }
                next = true;
            }
        result = filterNoRepeatResult(result);
        player.filterMoves();
        return result;
    }
    searchMove(xNow, yNow, xOld, yOld, xChecker, yChecker, player, result, arrCash, isKing) {
        if (!isKing) isKing = player.checkStatusOfChecker(yNow);
        let rangeArr = this.getActiveMovesOfKing(yNow, xNow, yOld, xOld, isKing);
        for (let el of rangeArr)
        for (let i of el[0]) {
            for(let j of el[1]) {
                if (!(Math.sign(yNow - yOld) === Math.sign(yNow - i) && Math.sign(xNow - xOld) === Math.sign(xNow - j))) {
                    if (j >= 0 && j <= 7 && i >= 0 && i <= 7 && i !== null && j !== null) {
                        let backCoord = { y: Math.round((i + yNow) / 2), x: Math.round((j + xNow) / 2)};
                        if (this.arrCells[i][j].hasChecker() && !this.arrCells[i][j].checker.owner.active && (isKing && (Math.abs(i - yNow) > 1 && Math.abs(j - xNow) > 1) ? !this.arrCells[backCoord.y][backCoord.x].hasChecker() : true || !isKing)) {
                            let rangeArrCurrent = this.getActiveEatingOfKing(yNow, xNow, i, j, isKing, yOld, xOld);
                            for (let element of rangeArrCurrent) {
                                let iCurrent = element[0];
                                let jCurrent = element[1];
                                    if (jCurrent >= 0 && jCurrent <= 7 && iCurrent >= 0 && iCurrent <= 7)
                                        if (!this.arrCells[iCurrent][jCurrent].hasChecker() && !this.checkArrMoves(i, j, arrCash)) {
                                            let newIsKing = isKing;
                                            if (!isKing) newIsKing = player.checkStatusOfChecker(iCurrent);
                                            let copyArrCash = arrCash.slice();
                                            copyArrCash.push({ move: {y: iCurrent, x: jCurrent}, rival: {y: i, x: j}, isKing: newIsKing });
                                            result.push({ y: iCurrent, x: jCurrent, eating: true });
                                            this.searchMove(jCurrent, iCurrent, xNow, yNow, xChecker, yChecker, player, result, copyArrCash, newIsKing);
                                            player.cash.treeOfMoves.push(copyArrCash);
                                        }
                            }
                        }
                    }
                }
            }
        }
    }
    checkArrMoves(y, x, arr){
        for (let i = 0; i < arr.length; i++)
            if (arr[i].rival.y === y && arr[i].rival.x === x) return true;
        return false;
    }
    getActiveMovesOfKing(y, x, yOld, xOld, isKing){
        let rangeArr = [];
        if (isKing)
            for (let i = 1; i < 8; i++){
                let yNew = { y1: y - i, y2: y + i };
                let xNew = { x1: x - i, x2: x + i };

                let arr = [];
                let index = rangeArr.push([]) - 1;
                for (let key in yNew)
                    if (yNew[key] >= 0 && yNew[key] < 8) arr.push(yNew[key]);
                    else arr.push(null);
                rangeArr[index].push(arr);
                let newArr = [];
                for (let key in xNew){
                    if (xNew[key] >= 0 && xNew[key] < 8) newArr.push(xNew[key]);
                    else newArr.push(null);
                }
                rangeArr[index].push(newArr);
                if (!rangeArr[index][0][0] && !rangeArr[index][0][1] || !rangeArr[index][1][0] && !rangeArr[index][1][1])
                    rangeArr.splice(index, 1);
            }
         else {
            let yNew = { y1: y - 1, y2: y + 1 };
            let xNew = { x1: x - 1, x2: x + 1 };
            rangeArr.push([[yNew.y1, yNew.y2], [xNew.x1, xNew.x2]]); 
            if (!rangeArr[0][0][0] && !rangeArr[0][0][1] || !rangeArr[0][1][0] && !rangeArr[0][1][1])
            rangeArr.splice(0, 1);
         }
        return rangeArr;
    }
    getActiveEatingOfKing(y, x, i, j, isKing, yOld = -1, xOld = -1){
        let rangeArrCurrent = [];
        if (isKing) {
            if (y > i)
                if (x > j)
                    for (let o = j - 1, w = i - 1; o >= 0 && w >= 0; o-- && w--)
                        if (yOld === w && xOld === o) {
                            rangeArrCurrent = [];
                            break;
                        } else {
                            if (!this.arrCells[w][o].hasChecker()) rangeArrCurrent.push([w, o]);
                            else break;
                        }
                else for (let o = j + 1, w = i - 1; o < 8 && w >= 0; o++ && w--)
                    if (yOld === w && xOld === o) {
                        rangeArrCurrent = [];
                        break;
                    } else {
                        if (!this.arrCells[w][o].hasChecker()) rangeArrCurrent.push([w, o]);
                        else break;
                    }
                else if (x > j)
                    for (let o = j - 1, w = i + 1; o >= 0 && w < 8; o-- && w++)
                        if (yOld === w && xOld === o) {
                            rangeArrCurrent = [];
                            break;
                        } else {
                            if (!this.arrCells[w][o].hasChecker()) rangeArrCurrent.push([w, o]);
                            else break;
                        }
                else
                    for (let o = j + 1, w = i + 1; o < 8 && w < 8; o++ && w++) 
                        if (yOld === w && xOld === o) {
                            rangeArrCurrent = [];
                            break;
                        } else {
                            if (!this.arrCells[w][o].hasChecker()) rangeArrCurrent.push([w, o]);
                            else break;
                        }

        } else {
            rangeArrCurrent.push([y > i ? i - 1 : i + 1, x > j ? j - 1 : j + 1]);
        }
        return rangeArrCurrent;
    }
    getCoordMovingChecker(coordFrom, coordTo) {
        let coordArr = [];
        let reverseCoordFrom = this.reverseCoord(coordFrom)[0];
        let reverseCoordTo = this.reverseCoord(coordTo)[0];
        let checker;
        let isKing = false;
        if (this.player1.active) {
            checker = this.arrCells[reverseCoordFrom.y][reverseCoordFrom.x].removeChecker();
            this.arrCells[reverseCoordTo.y][reverseCoordTo.x].setChecker(checker);
            coordArr.push({coordFrom, coordTo});
            coordArr.push({coordFrom: reverseCoordFrom, coordTo: reverseCoordTo});
            this.player1.cash.treeOfMoves.forEach(el => {
                if (el[el.length - 1].move.y === reverseCoordTo.y && el[el.length - 1].move.x === reverseCoordTo.x) isKing = el[el.length - 1].isKing;
            });
            checker.isKing = isKing;
        }
        if (this.player2.active) {
            checker = this.arrCells[coordFrom.y][coordFrom.x].removeChecker();
            this.arrCells[coordTo.y][coordTo.x].setChecker(checker);
            coordArr.push({coordFrom: reverseCoordFrom, coordTo: reverseCoordTo});
            coordArr.push({coordFrom, coordTo});
            this.player2.cash.treeOfMoves.forEach(el => {
                if (el[el.length - 1].move.y === coordTo.y && el[el.length - 1].move.x === coordTo.x) isKing = el[el.length - 1].isKing;
            }); 
            checker.isKing = isKing;
        }
        this.countOfMoves++;
        return { coordArr, isKing };
    }
    getCoordEatingChecker(coordTo) {
        let coordArr = [];
        let reverseCoordTo = this.reverseCoord(coordTo)[0];
        if (this.player1.active) {
            let resultCoordArr = this.player1.getCoordEatingCheckerToCoordTo(reverseCoordTo.y, reverseCoordTo.x);
            this.player1.eatCheckers(resultCoordArr);
            let reverseCoordArr = this.reverseCoord(...resultCoordArr);
            coordArr.push(reverseCoordArr);
            coordArr.push(resultCoordArr);
        }
        if (this.player2.active) {
            let resultCoordArr = this.player2.getCoordEatingCheckerToCoordTo(coordTo.y, coordTo.x);
            this.player2.eatCheckers(resultCoordArr);
            let reverseCoordArr = this.reverseCoord(...resultCoordArr);
            coordArr.push(reverseCoordArr);
            coordArr.push(resultCoordArr);
        }
        this.countOfMoves = 0;
        return coordArr;
    }
}

