var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
import {produce} from 'immer';
import * as uuidv4 from 'uuid/v4';

import {cardConfig} from './gameConfig';
import {CardDataModel, GameState, EntityTypes, Client} from '../../common/dataModelDefinitions';
import {SocketEventTypes} from '../../common/socketEventTypes'
import {handleMouseInput} from './eventHandlers'
import { MouseInput } from '../../common/mouseEventTypes';
import {clientFactory, cardFactory} from './factories';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

type ServerState = {
    gameState: GameState
}

const serverState: ServerState ={
    gameState: {
        cards:[],
        clients: []
    },
};

function init() {
    serverState.gameState = produce(serverState.gameState, draft => {
        const newCards: CardDataModel[] = [cardFactory(0, 0), cardFactory(0, 100), cardFactory(100, 0)];
        draft.cards = newCards;
    })
}

init();

io.on('connection', function(socket){
    console.log('a user connected');

    let newClient = clientFactory();
    serverState.gameState = produce(serverState.gameState, draft => {
        draft.clients.push(newClient);
    });

    socket.on(SocketEventTypes.MOUSE_INPUT, (input: MouseInput) =>{
        serverState.gameState = handleMouseInput(serverState.gameState, input);
        console.log(`Event type: ${input.type}`);
        io.emit(SocketEventTypes.SYNC, serverState.gameState);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
      });

    io.emit('connection_accepted', newClient.clientInfo);
    io.emit(SocketEventTypes.SYNC, serverState.gameState);
});

http.listen(3001, function(){
  console.log('listening on localhost:3001');
});