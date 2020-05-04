import express from 'express';
import SocketIO from 'socket.io';
import {produce} from 'immer';
import * as http from 'http';
import {tableRouter} from './routes/table/tableRoute';
import { TableModule } from './socket-modules/table/tableModule';
import { getServerState, addTable } from './state';
import { createTable } from './socket-modules/table/createTable';
import { deckFactory } from './factories';
import { CardTypes } from './types/dataModelDefinitions';

// import {DisplayCardEntity, DeckEntity, GameState, Directions, Client, ClientHand, CardTypes} from './types/dataModelDefinitions';
// import {SocketEventTypes} from './types/socketEventTypes'
// import {handleVerb} from './handlers/verbs'
// import {clientFactory, cardFactory, deckFactory, clientHandFactory} from './factories';
// import { Verb } from './types/verbTypes';
// import { getServerState, setGameState, getGameState } from './state';
// import { extractClientBySocketId, extractNumberOfClients, extractDirections, extractCardFromClientHandById } from './extractors';

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

TableModule(io);
const devTable = createTable(6);
devTable.tableId = 'dev'
devTable.gameState.decks.push(deckFactory(CardTypes.FRENCH, 0, 0));
addTable(devTable)

app.use(express.json());
app.use(tableRouter);


// const serverState = getServerState();

// function init() {
//     serverState.gameState = produce(serverState.gameState, draft => {
//         const newCards: DisplayCardEntity[] = [cardFactory(0, 0,CardTypes.FRENCH, 'A'), cardFactory(0, 100,CardTypes.FRENCH, '2'), cardFactory(100, 0,CardTypes.FRENCH, 'Q')];
//         const newDecks: DeckEntity[] = [deckFactory(CardTypes.FRENCH,100, 100)]
//         draft.cards = newCards;
//         draft.decks = newDecks;
//     })
//     serverState.directions = [Directions.NORTH, Directions.SOUTH, Directions.NORTH_EAST, Directions.SOUTH_EAST, Directions.NORTH_WEST, Directions.SOUTH_WEST];
// }

// init();



// io.on('connection', function(socket){
//     try{
//         console.log('a usPdataer connected');
//         const numberOfClients = extractNumberOfClients(getGameState());
//         const directions = extractDirections(getServerState());

//         let newClient = clientFactory(socket.id, directions[numberOfClients]);
//         let newHand = clientHandFactory(newClient.clientInfo.clientId);
//         serverState.gameState = produce(serverState.gameState, draft => {
//             draft.clients.push(newClient);
//             draft.hands.push(newHand);
//         });

//         //creating room


//         socket.on(SocketEventTypes.VERB, (verb: Verb) =>{
//             try{
//                 // console.log(`Verb type: ${verb.type}`);
//                 serverState.gameState = handleVerb(serverState.gameState, verb);
//             }
//             catch(e){
//                 console.error(e)
//             }
//             io.emit(SocketEventTypes.SYNC, serverState.gameState);
//         });

//         socket.on('disconnect', function(){
//             try {
//                 const gameState = getGameState();
//                 const nextGameState = produce(gameState, draft => {
//                     const {clientId} = extractClientBySocketId(gameState, socket.id).clientInfo;
//                     draft.clients = gameState.clients.filter(client => client.clientInfo.clientId !== clientId);
//                     draft.hands = gameState.hands.filter(hand => hand.clientId !== clientId);
//                 });
//                 setGameState(nextGameState);
//                 console.log('user disconnected');
//             }catch(e){
//                 console.error(e)
//             }
            
//         });

//         socket.emit('connection_accepted', newClient.clientInfo);
//         io.emit(SocketEventTypes.SYNC, serverState.gameState);
//     }
//     catch(e){
//         console.log(e);
//     }
// });

server.listen(3001, function(){
  console.log('listening on localhost:3001');
});

export {
    server
};