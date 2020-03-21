var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
import {produce} from 'immer';
import * as uuidv4 from 'uuid/v4';

import {frenchCardConfig} from './gameConfig';
import {CardEntity, DeckEntity, GameState, EntityTypes, Client} from '../../common/dataModelDefinitions';
import {SocketEventTypes} from '../../common/socketEventTypes'
import {handleVerb} from './eventHandlers'
import { MouseInput } from '../../common/mouseEventTypes';
import {clientFactory, cardFactory, deckFactory} from './factories';
import { Verb, DeckVerbTypes } from '../../common/verbTypes';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

type ServerState = {
    gameState: GameState
}

const serverState: ServerState ={
    gameState: {
        cards:[],
        decks: [],
        clients: []
    },
};

function init() {
    serverState.gameState = produce(serverState.gameState, draft => {
        const newCards: CardEntity[] = [cardFactory(0, 0, 'A'), cardFactory(0, 100, '2'), cardFactory(100, 0, 'Q')];
        const newDecks: DeckEntity[] = [deckFactory(100, 100, 10, 10)]
        draft.cards = newCards;
        draft.decks = newDecks;
    })
}

init();

io.on('connection', function(socket){
    console.log('a user connected');

    let newClient = clientFactory();
    serverState.gameState = produce(serverState.gameState, draft => {
        //TODO: THIS IS TEMPORARY UNTIL MULTIPLE CLIENTS ARE GETTING TESTED
        // draft.clients = [newClient];
        draft.clients.push(newClient)
    });

    socket.on(SocketEventTypes.VERB, (verb: Verb) =>{
        try{
            console.log(`Verb type: ${verb.type}`);
            serverState.gameState = handleVerb(serverState.gameState, verb);
        }
        catch(e){
            console.error(e)
        }
        console.log(serverState.gameState.decks[0].cards)
        io.emit(SocketEventTypes.SYNC, serverState.gameState);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
      });

    io.emit('connection_accepted', newClient.clientInfo);
    console.log(serverState.gameState.decks[0].cards)
    io.emit(SocketEventTypes.SYNC, serverState.gameState);
});

http.listen(3001, function(){
  console.log('listening on localhost:3001');
});