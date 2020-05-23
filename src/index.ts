import express from 'express';
import SocketIO from 'socket.io';
import http from 'http';
import cors from 'cors';
import {tableRouter} from './routes/table/tableRoute';
import { TableModule } from './socket-modules/table/tableModule';
import {addTable, initServerState, gameStateSetter, gameStateGetter } from './state';
import { createTable } from './socket-modules/table/createTable';
import produce, { enableMapSet } from 'immer';
import { deckFactory } from './factories';
import { CardTypes } from './types/dataModelDefinitions';
import { initialGameState } from './mocks/initialGameState';

const app = express();
app.use(express.json());
app.use(cors());
app.use(tableRouter);

const server = http.createServer(app);
const io = SocketIO(server, {
    serveClient: false,
});
TableModule(io);

const node_env = process.env.NODE_ENV;
if(node_env === 'production'){
    initServerState();
}
else if(node_env === 'development'){
    initServerState();
    let [devTable, gameState] = createTable(4100, 2200, [0,0],'dev');
    gameState = produce(gameState, draft => {
        const deck1 = deckFactory(CardTypes.FRENCH, 0, 0)
        const deck2 = deckFactory(CardTypes.FRENCH, 0,170)
        console.log(deck1.entityId);
        console.log(deck2.entityId);
        draft.decks.set(deck1.entityId, deck1);
        draft.decks.set(deck2.entityId, deck2);
    })
    addTable(devTable, gameState);
    console.log(`Dev table set up. Id: ${devTable.tableId}`);
}

const port = process.env.PORT || 3001;
server.listen(port, function(){
    console.log(`running in ${node_env} mode`);
    console.log(`listening on port ${port}` );
});

