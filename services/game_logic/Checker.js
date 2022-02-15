export default class Checker {
    constructor(owner, cell) {
        this.color = owner.active ? owner.constructor.WHITE : owner.constructor.BLACK;
        this.owner = owner;
        this.cell = cell;
        this.isKing = false;
    }
    changeToKing(){
        if (this.isKing)
            return false;
        else {
            this.isKing = true;
            return true;
        }
    }
}
