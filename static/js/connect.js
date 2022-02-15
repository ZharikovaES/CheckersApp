import Game from './Game.js';

let game = null;

//import Game from './Game.js';

//const socket = io("http://localhost");
const socket = io.connect();
//let game = null;

socket.emit('connect room', window.location.href);
socket.on('update page', ()=>{
    //game = new Game();
    console.log("update page");
    //window.location.href = "http://localhost:3000/multiplayer-mode/play";

    game = new Game();

});


