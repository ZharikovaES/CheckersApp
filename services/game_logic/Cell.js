export default class Cell {
    static WHITE = "#d9d9d7";
    static BLACK = "#5e5e5e";

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.checker = null;
        if (this.y % 2 === 0) {
            if (this.x % 2 === 0) this.color = Cell.WHITE;
            else this.color = Cell.BLACK;
        } else {
            if (this.x % 2 !== 0) this.color = Cell.WHITE;
            else this.color = Cell.BLACK;
        }
    }
    setChecker(checker) {
        let owner = null;
        if (checker) owner = checker.owner;
        owner.changeStatusOfChecker(this.y, checker);
        if (this.checker) this.checker.cell = this;
        this.checker = checker;
    }
    hasChecker() {
        return this.checker !== null;
    }
    removeChecker() {
        let checker = this.checker;
        this.checker = null;
        return checker;
    }
}
