import express from 'express';
import SocketIO from 'socket.io';
import http from 'http';
import cors from 'cors';
import {tableRouter} from './routes/table/tableRoute';
import { TableModule } from './socket-modules/table/tableModule';
import {addTable, initServerState, gameStateSetter, gameStateGetter } from './state';
import { createTable } from './socket-modules/table/createTable';
import produce, { enableMapSet } from 'immer';

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
    const devTable1 = createTable(6, 'dev1');
    const devTable2 = createTable(6, 'dev2');
    addTable(devTable1);
    addTable(devTable2);
    gameStateSetter(devTable1.tableId)(produce(gameStateGetter(devTable1.tableId)(), draft => {
        for(let i=0; i < 1000; i++){
            // draft.cards.set(cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, 'card-' + i));
        }
        console.log('ready for testing');
    }))
    gameStateSetter(devTable2.tableId)(produce(gameStateGetter(devTable2.tableId)(), draft => {
        for(let i=0; i < 15; i++){
            // draft.cards.push(cardFactory(0,0,CardTypes.FRENCH, undefined, undefined, 'card-' + i));
        }
        console.log('ready for testing');
    }))
}

const port = process.env.PORT || 3001;
server.listen(port, function(){
    console.log(`running in ${node_env} mode`);
    console.log(`listening on port ${port}` );
});

