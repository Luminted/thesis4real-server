import assert from 'assert';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import { TableModuleClientEvents } from "../../../types/socketTypes";
import { TableModule } from '../tableModule';
import { GameState, CardTable } from '../../../types/dataModelDefinitions';
import { initServerState, gameStateGetter, addTable, lookupClientId, gameStateSetter, addSocketClientIdMapping } from '../../../state';
import { createTable } from '../createTable';
import produce from 'immer';
import { createClient, clientHandFactory } from '../../../factories';
import * as leaveTableHandler from '../handlers/leave-table'

describe(`Testing ${TableModuleClientEvents.LEAVE_TABLE}`, function(){
    const url = 'http://localhost';
    const port = 4001;
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
            const client = createClient(clientId);
            const hand = clientHandFactory(clientId);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, hand);
        })

        gameStateSetter(playTable.tableId)(gameState);

        tableModule.once('connection', socket => {
            socket.join(playTable.tableId);
        });

        clientSocket = SocketIOClient(`${url}:${port}${namespace}`, {
            query: {
                tableId: playTable.tableId
            }
        });
        clientSocket.on('connect', () => {
            addSocketClientIdMapping(playTable.tableId, clientId, clientSocket.id);
            done();
        })
    })

    afterEach((done) => {
        clientSocket.disconnect();
        setTimeout(done, 100)
    })

    this.afterAll(() => {
        socketServer.close();
    })

    it('should remove socket from socketClientIdMapping', function(done){
        clientSocket.emit(TableModuleClientEvents.LEAVE_TABLE, () => {
            assert.equal(lookupClientId(playTable.tableId, clientSocket.id), undefined);
            done();
        })
    })
})