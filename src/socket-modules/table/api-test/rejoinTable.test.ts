import assert from 'assert';
import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import {spy} from 'sinon';
import { TableModuleClientEvents, ClientConnectionStatuses } from "../../../types/socketTypes";
import { CardTable, GameState } from "../../../types/dataModelDefinitions";
import { TableModule } from "../tableModule";
import { initServerState, gameStateGetter, addTable, getServerState, lookupClientId, addSocketClientIdMapping, gameStateSetter } from '../../../state';
import { createTable } from '../createTable';
import * as rejoinTableHandler from '../handlers/rejoin-table';
import produce from 'immer';
import { clientFactory } from '../../../factories';

describe(`Testing ${TableModuleClientEvents.REJOIN_TABLE}`, function(){
    const url = 'http://localhost';
    const port = 4003;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableModule = TableModule(socketServer);
    const clientId = 'client-1';
    
    let getGameState: () => GameState;
    let clientSocket: SocketIOClient.Socket;
    let playTable: CardTable;
    let gameState: GameState;

    beforeEach((done)=> {
        initServerState();
        [playTable, gameState] = createTable(0,0);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable, gameState);

        gameState = produce(gameState, draft => {
            const client = clientFactory(clientId);
            client.status = ClientConnectionStatuses.DISCONNECTED;
            draft.clients.set(clientId, client);
        })
        gameStateSetter(playTable.tableId)(gameState);

        clientSocket = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            autoConnect: false,
            reconnection: false,
            query: {
                tableId: playTable.tableId
            }
        });
        clientSocket.on('connect', () => {
            done();
        })
        clientSocket.connect();

    })
    
    afterEach((done) => {
        clientSocket.disconnect();
        setTimeout(done, 100)
    })

    this.afterAll(() => {
        socketServer.close()
    })

    it('should update socketClientIdMapping', function(done){
        clientSocket.emit(TableModuleClientEvents.REJOIN_TABLE, clientId, function(){
            assert.equal(lookupClientId(playTable.tableId, clientSocket.id), clientId);
            done();
        })
    })

    //TODO: Implement tests after communication has been optimized
    // it('should lookup clientId of socket and call handleRejoin with it')
    // it('should call acknowledgement function with rejoined clients clientInfo');
    // it('should call acknowledgement function with gameState');
    // it('should broadcast gameState to other clients');
    // it('should set next state')
})