import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import assert from 'assert';
import {spy} from 'sinon';

import { TableModule } from '../tableModule';
import { TableModuleClientEvents, TableModuleServerEvents, JoinTablePayload } from '../../../types/socketTypes';
import { createTable } from '../createTable';
import { initServerState, addTable, gameStateGetter, getTableById, gameStateSetter, lookupClientId, getServerState } from '../../../state';
import { CardTable, GameState, ClientInfo, SerializedGameState, Seats } from '../../../types/dataModelDefinitions';
import { extractClientById } from '../../../extractors/gameStateExtractors';
import * as utils from '../utils';
import * as joinTableHandler from '../handlers/join-table/handleJoinTable'; 



describe(`Socket event: ${TableModuleClientEvents.JOIN_TABLE}`, function(){
    const url = 'http://localhost';
    const port = 4002;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableModule = TableModule(socketServer);
    let getGameState: () => GameState;
    let client1: SocketIOClient.Socket;
    let playTable: CardTable;

    beforeEach((done)=> {

        initServerState();
        let gameState;
        [playTable, gameState] = createTable(0,0);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable, gameState);
        client1 = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            autoConnect: false,
            reconnection: false,
            query: {
                tableId: playTable.tableId
            }
        });
        client1.on('connect', () => {
            done();
        })
        client1.connect();
    })

    afterEach((done) => {
        client1.disconnect();
        setTimeout(done, 100)
    })

    this.afterAll(() => {
        socketServer.close()
    })

    it('should join client socket to tables room',function(done){
        client1.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            socketServer.of('namespace').clients((err) => {
                assert.equal(tableModule.sockets[client1.id].rooms[playTable.tableId], playTable.tableId);
            })
            done();
        });
    });
    it('should call acknowledgement function with clients clientInfo', function(done){
        client1.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo, gameState: GameState) =>{
            const client = extractClientById(getGameState(), lookupClientId(playTable.tableId, client1.id));
            assert.deepEqual(clientInfo, client.clientInfo);
            done();
        })
    })
    it('should call acknowledgement function with the serialized updated game state', function(done){
        const serializeGameStateSpy = spy(utils, 'serializeGameState');
        client1.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo, gameState: GameState) =>{
            const serializedState = serializeGameStateSpy.returnValues[0];
            assert.equal(serializeGameStateSpy.called, true);
            assert.deepEqual(gameState, serializedState);
            serializeGameStateSpy.restore();
            done();
        })
    })
    it('should set the state with the updated game state', function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        client1.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            assert.deepEqual(getGameState(), handleJoinTableSpy.returnValues[0]);
            handleJoinTableSpy.restore();
            done();
        })
    })
    it(`should broadcast ${TableModuleServerEvents.SYNC} to other clients with serialized updated game state`, function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        const serializeGameStateSpy = spy(utils, 'serializeGameState');
        const client2 = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            reconnection: false,
            autoConnect: false,
            query: {
                tableId: playTable.tableId
            }
        });
        client2.once(TableModuleServerEvents.SYNC, (gameState: SerializedGameState) => {
            let handlerResult = handleJoinTableSpy.returnValues[0];
            assert.equal(serializeGameStateSpy.calledWith(handlerResult), true);
            assert.deepEqual(gameState, serializeGameStateSpy.returnValues[1]);
            handleJoinTableSpy.restore();
            serializeGameStateSpy.restore();
            client2.disconnect();
            done();
        })
        client2.once('connect', () => {
            client2.emit(TableModuleClientEvents.JOIN_TABLE, () => {
                client1.emit(TableModuleClientEvents.JOIN_TABLE);
            })
        })
        client2.connect();
    })
    it('should add client to socketClientIdMapping', function(){
        client1.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo) => {
            assert.equal(playTable.socketClientIdMapping[client1.id], clientInfo.clientId);
        })
    })
})