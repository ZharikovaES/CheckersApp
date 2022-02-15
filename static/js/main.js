'use strict';
import Game from './Game.js';

export const socket = io.connect();

const contentBlock = document.querySelector(".content");
const usernameFormWrapper = contentBlock ? contentBlock.querySelector(".content-username-form__wrapper") : null;
const linkFormWrapper = contentBlock ? contentBlock.querySelector(".content-link-form__wrapper") : null;
const linkInput = document.querySelector("#link");
const copyLinkBtn = document.querySelector(".link-form__btn");
const popUp = document.querySelector(".pop-up");

let game;
let loader = document.querySelector('.loader');

if (loader)
    window.addEventListener('load', e => {
        let link = window.location.href;
        socket.emit('connect to room', { link });
    });

if (linkInput && copyLinkBtn)
    copyLinkBtn.addEventListener('click', e => {
        if (navigator.clipboard)
            navigator.clipboard.writeText(linkInput.value).catch (err => { console.log(err); });
        else {
            linkInput.select();
            document.execCommand('copy');
        }
    });
if (contentBlock){
    const usernameForm = contentBlock.querySelector("#username-form");
    if (usernameForm) {
        const usernameInput = usernameForm.querySelector("#username-input");
        const playBtn = usernameForm.querySelector("#play-btn");
        if (usernameInput && playBtn)
            playBtn.addEventListener('click', e => {
                usernameInput.value = usernameInput.value.replace(/^\s+$/, '');
            })    
    }
}
if (usernameFormWrapper) {
    const usernameForm = usernameFormWrapper.querySelector("#username-form");
    const usernameInput = usernameFormWrapper.querySelector("#username-input");
    const playBtn = usernameFormWrapper.querySelector("#play-btn");
    let link = window.location.href;
    if (usernameForm && usernameInput && playBtn)
        playBtn.addEventListener('click', e => {
            if (usernameForm.checkValidity()) socket.emit("completing connect to room", { link, username: usernameInput.value });
            else usernameForm.reportValidity();
        });
}
function showPopUpForInterruptedGame(str){
    if (popUp) {
        const head = popUp.querySelector(".pop-up__head");
        const text = popUp.querySelector(".pop-up__text");
        if (head && text && str){
            head.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Упппс... <i class="fas fa-bomb"></i>`;
            text.innerText = str;
        }
        popUp.classList.add("show");
    }
}
function showPopUpForCompletedGame(str){
    if (popUp) {
        const head = popUp.querySelector(".pop-up__head");
        const text = popUp.querySelector(".pop-up__text");
        if (head && text && str){
            head.innerHTML = '<i class="fas fa-trophy"></i>';
            text.innerText = str;
        }
        popUp.classList.add("show");
    }
}
socket.on('start game', data =>{
    if (contentBlock) {
        loader.classList.remove('show');
        contentBlock.classList.remove('show');
        game = new Game(data);
    }
});
socket.on('get username', data =>{
    if (contentBlock) {
        loader.classList.remove('show');
        if (usernameFormWrapper) usernameFormWrapper.style.display = "block";
        contentBlock.classList.add('show');
    }
});
socket.on('link', data =>{
    window.location.href = data.link;

});
socket.on('copy link', data => {
    setTimeout(() => {
        loader.classList.remove('show');
        if (contentBlock && linkFormWrapper) {
            if (linkFormWrapper) linkFormWrapper.style.display = "block";
            contentBlock.classList.add('show');
        }
    }, 2000)
});
socket.on("set active empty cell", data => {
    let coordArr = data.coordTo;
    for (let coord of coordArr) {
        game.arrCells[coord.y][coord.x].checkerCell.classList.add('checker--move');
        coord.eating ? game.arrCells[coord.y][coord.x].addEventEat(game.arrCells[data.coordFrom.y][data.coordFrom.x]) : game.arrCells[coord.y][coord.x].addEventMove(game.arrCells[data.coordFrom.y][data.coordFrom.x]);
    }
});
socket.on("set moving checker", data => {
    game.clearActive();    
    game.moveCheckerOfPlayer({ coord: data.coord, isKing: data.isKing});
    game.nextGameTurn(data.actives);
});
socket.on("get eating-checkers", coordArr => {
    game.eatCheckers(coordArr);
});
socket.on("game over", data => {
    showPopUpForCompletedGame(data.text);
});
socket.on("incorrect entered data", () => {
    const usernameForm = usernameFormWrapper.querySelector("#username-form");
    const usernameInput = usernameFormWrapper.querySelector("#username-input");
    if (usernameForm && usernameInput) usernameInput.value = '';
});
socket.on("game finished", data => {
    showPopUpForInterruptedGame(data.text);
});
socket.on("game interrupted", data => {
    showPopUpForInterruptedGame(data.text);
});
socket.on("game error", data => {
    showPopUpForInterruptedGame(data.text);
});

    