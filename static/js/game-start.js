import Game from './Game.js';

let game = null;

var socket = io();
// socket.on('connect', function() {   //  'connect' event is received on client on every connection start.
//     socket.emit('join', user);  //  where 'user' is your object containing email.
// })

socket.emit('connect to room repeat', window.location.href);
socket.on('update page', ()=>{
    //game = new Game();
    console.log("update page");
    //window.location.href = "http://localhost:3000/multiplayer-mode/play";

    game = new Game();

});



