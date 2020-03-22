var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
import {produce} from 'immer';

import {CardEntity, DeckEntity, GameState} from '../../common/dataModelDefinitions';
import {SocketEventTypes} from '../../common/socketEventTypes'
import {handleVerb} from './handlers/verbs'
import {clientFactory, cardFactory, deckFactory} from './factories';
import { Verb } from '../../common/verbTypes';

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
        const newDecks: DeckEntity[] = [deckFactory(100, 100)]
        draft.cards = newCards;
        draft.decks = newDecks;
    })
}

init();

io.on('connection', function(socket){
    console.log('a user connected');

    let newClient = clientFactory();
    serverState.gameState = produce(serverState.gameState, draft => {
        //TODO: clear out list on disconnect
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