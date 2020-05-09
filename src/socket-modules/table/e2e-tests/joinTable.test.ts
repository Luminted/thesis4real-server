import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import assert from 'assert';
import {spy} from 'sinon';

import { TableModule } from './../tableModule';
import { TableModuleClientEvents, TableModuleServerEvents } from '../../../types/sockeTypes';
import { createTable } from './../createTable';
import { initServerState, addTable, gameStateGetter } from '../../../state';
import { PlayTable, GameState, ClientInfo, SerializedGameState } from '../../../types/dataModelDefinitions';
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
    let playTable: PlayTable;

    beforeEach((done)=> {
        initServerState();
        playTable = createTable(1);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable);
        client1 = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            reconnection: false,
            query: {
                tableId: playTable.tableId
            }
        });
        client1.on('connect', () => {
            done();
        })
    })

    afterEach((done) => {
        if(client1.connected){
            client1.disconnect();
            setTimeout(done, 500)
        }
    })

    this.afterAll(() => {
        socketServer.close()
    })

    it('should join client to tables room if table exists',function(done){
        client1.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            socketServer.of('namespace').clients((err) => {
                assert.equal(tableModule.sockets[client1.id].rooms[playTable.tableId], playTable.tableId);
            })
            done();
        });
    });
    it('should call acknowledgement function with created clients info', function(done){
        client1.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo, gameState: GameState) =>{
            const client = extractClientById(getGameState(), client1.id);
            assert.deepEqual(clientInfo, client.clientInfo);
            done();
        })
    })
    it('should call acknowledgement function with result of serializeGameState', function(done){
        const serializeGameStateSpy = spy(utils, 'serializeGameState');
        client1.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo, gameState: GameState) =>{
            const serializedState = serializeGameStateSpy.returnValues[0];
            assert.equal(serializeGameStateSpy.called, true);
            assert.deepEqual(gameState, serializedState);
            serializeGameStateSpy.restore()
            done();
        })
    })
    it('should set the state with the result of handleJoinTable', function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        client1.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            assert.deepEqual(getGameState(), handleJoinTableSpy.returnValues[0]);
            handleJoinTableSpy.restore();
            done();
        })
    })
    it('should call handleJoinTable with tables game state', function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        const originalGameState = getGameState();
        client1.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            assert.equal(handleJoinTableSpy.called, true);
            assert.deepEqual(handleJoinTableSpy.args[0][0], originalGameState);
            handleJoinTableSpy.restore();
            done();
        })
    })
    it(`should broadcast ${TableModuleServerEvents.SYNC} to other clients with the result of serializeGameState called with the result of handleJoinTable`, function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        const serializeGameStateSpy = spy(utils, 'serializeGameState');
        const client2 = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            reconnection: false,
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
            done();
        })
        client2.once('connect', () => {
            client2.emit(TableModuleClientEvents.JOIN_TABLE, () => {
                client1.emit(TableModuleClientEvents.JOIN_TABLE);
            })
        })
        
    })
})