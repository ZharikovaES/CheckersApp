export default class Player {
    arrCheckers = [];
    constructor(name, rows, colors, status, active, game) {
        this.name = name;
        this.rows = rows;
        this.color = colors;
        this.status = status;
        this.active = active;
        this.game = game;
    }
    pushChecker(checker) {
        if (this.status === "player" && this.active) checker.addEventClick();
        this.arrCheckers.push(checker);
    }
    moveChecker(data) {
        let checker = this.game.removeChecker(data.coord.coordFrom);
        checker.setIsKing(data.isKing);
        this.game.pushChecker(data.coord.coordTo, checker);
    }
    eatChecker(coordArr){
        coordArr.forEach(coord => {
            this.removeChecker(this.game.getCheckerByCoord(coord));
            const checkerRival = this.game.removeChecker(coord);
        });
    }
    removeChecker(removingChecker){
        removingChecker.owner.defeat(removingChecker);
    }
    defeat(myChecker){
        this.arrCheckers = this.arrCheckers.filter((el) => !(el.cell.y === myChecker.cell.y && el.cell.x === myChecker.cell.x));
    }
    changeEventActive(){
        this.arrCheckers.forEach(el => {
            if (this.status === "rival" || !this.active) {
                el.removeEventClick();
            }
            if (this.status === "player" && this.active) {
                el.addEventClick();
            }
        });
    }
}
