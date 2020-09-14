import express from 'express';
import http from 'http';
import cors from 'cors';
import {tableRouter} from './routes/table/tableRoute';
import { deckFactory } from './factories';
import { CardTypes } from './types/dataModelDefinitions';
import { Container } from 'typescript-ioc';
import { Socket } from './socket';
import { TableStateStore } from './stores/TableStateStore/TableStateStore';

const app = express();
app.use(express.json());
app.use(cors());
app.use(tableRouter);

const server = http.createServer(app);
Container.bindName("httpServer").to(server);

Container.get(Socket);

const node_env = process.env.NODE_ENV;
if(node_env === 'production'){
}
else if(node_env === 'development'){
    // let [devTable, gameState] = createTable(4100, 2200, 2, [0,0],'dev');
    const tableStore = Container.get(TableStateStore);
    const {gameStateStore} = tableStore
    gameStateStore.changeState(draft => {
        const deck1 = deckFactory(CardTypes.FRENCH, 0, 0)
        const deck2 = deckFactory(CardTypes.FRENCH, 0,170)
        console.log(deck1.entityId);
        console.log(deck2.entityId);
        draft.decks.set(deck1.entityId, deck1);
        draft.decks.set(deck2.entityId, deck2);
    })
    console.log(`Dev table set up. Id: whatever`);
}

const port = process.env.PORT || 3001;
server.listen(port, function(){
    console.log(`running in ${node_env} mode`);
    console.log(`listening on port ${port}` );
});

