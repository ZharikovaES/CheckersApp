export default class Checker {
    constructor(color, owner, cell) {
        this.color = color;
        this.owner = owner;
        this.cell = cell;
        this.isKing = false;

        this.checker = document.createElement('div');
        this.checker.classList.add('checker');
        this.checker.style.backgroundColor = this.color;
        this.checkerClick = (e) => {
            this.cell.activeCell();
        }
    
    }
    setIsKing(value){
        if (value) {
            this.isKing = value;
            this.checker.classList.add('checker-king');
        }
    }
    addEventClick() {
        this.checker.addEventListener('click', this.checkerClick);
    }
    removeEventClick() {
        this.checker.removeEventListener('click', this.checkerClick);
    }

}
