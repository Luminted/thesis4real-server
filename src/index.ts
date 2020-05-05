import express from 'express';
import SocketIO from 'socket.io';
import http from 'http';
import cors from 'cors';
import {tableRouter} from './routes/table/tableRoute';
import { TableModule } from './socket-modules/table/tableModule';
import {addTable, initServerState, gameStateSetter, gameStateGetter } from './state';
import { createTable } from './socket-modules/table/createTable';
import { deckFactory, cardFactory } from './factories';
import { CardTypes } from './types/dataModelDefinitions';
import produce from 'immer';

const app = express();
app.use(express.json());
app.use(cors());
app.use(tableRouter);

const server = http.createServer(app);
const io = SocketIO(server);
TableModule(io);

const node_env = process.env.NODE_ENV;
if(node_env === 'production'){
    initServerState();
}
else if(node_env === 'development'){
    initServerState();
    const devTable = createTable(6, 'dev');
    addTable(devTable);
    gameStateSetter(devTable.tableId)(produce(gameStateGetter(devTable.tableId)(), draft => {
        for(let i=0; i < 200; i++){
            draft.cards.push(cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, 'card-' + i));
        }
        console.log('ready for testing');
    }))
}

const port = process.env.PORT || 3001;
server.listen(port, function(){
    console.log(`running in ${node_env} mode`);
    console.log(`listening on port ${port}` );
});

