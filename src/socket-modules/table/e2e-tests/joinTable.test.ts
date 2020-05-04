import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import assert from 'assert';
import {spy} from 'sinon';

import { TableModule } from './../tableModule';
import { TableModuleClientEvents, TableModuleServerEvents } from '../../../types/sockeTypes';
import { createTable } from './../createTable';
import { initServerState, addTable, gameStateGetter } from '../../../state';
import { PlayTable, GameState, ClientInfo } from '../../../types/dataModelDefinitions';
import * as joinTableHandler from '../handlers/join-table/handleJoinTable'; 
import { extractClientById } from '../../../extractors/gameStateExtractors';



describe(`Socket event: ${TableModuleClientEvents.JOIN_TABLE}`, function(){
    const url = 'http://localhost';
    const port = 4002;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableModule = TableModule(socketServer);
    let getGameState: () => GameState;
    let socket: SocketIOClient.Socket;
    let playTable: PlayTable;

    this.beforeEach((done)=> {
        initServerState();
        playTable = createTable(1);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable);
        socket = SocketIOClient(`${url}:${port}${namespace}`, {
            forceNew: true,
            reconnection: false,
            query: {
                tableId: playTable.tableId
            }
        });
        socket.on('connect', () => {
            console.log(`connected to ${url}${namespace}`);
            done();
        })
    })

    this.afterEach((done) => {
        if(socket.connected){
            socket.disconnect();
            setTimeout(done, 500)
        }
    })

    this.afterAll(() => {
        socketServer.close()
    })

    it('should join client to tables room if table exists',function(done){
        socket.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            socketServer.of('namespace').clients((err) => {
                assert.equal(tableModule.sockets[socket.id].rooms[playTable.tableId], playTable.tableId);
            })
            done();
        });
    });
    it('should call acknowledgement function if given with clients info', function(done){
        socket.emit(TableModuleClientEvents.JOIN_TABLE, (clientInfo: ClientInfo) =>{
            const client = extractClientById(getGameState(), socket.id);
            assert.deepEqual(clientInfo, client.clientInfo);
            done();
        })
    })
    it('should set the state with the result of handleJoinTable', function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        socket.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            assert.deepEqual(getGameState(), handleJoinTableSpy.returnValues[0]);
            handleJoinTableSpy.restore();
            done();
        })
    })
    it('should call handleJoinTable with tables game state', function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        const originalGameState = getGameState();
        socket.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            assert.equal(handleJoinTableSpy.called, true);
            assert.deepEqual(handleJoinTableSpy.args[0][0], originalGameState);
            handleJoinTableSpy.restore();
            done();
        })
    })
    it(`should emit ${TableModuleServerEvents.SYNC} with result of handleJoinTable`, function(done){
        const handleJoinTableSpy = spy(joinTableHandler, 'handleJoinTable');
        socket.emit(TableModuleClientEvents.JOIN_TABLE);
        socket.once(TableModuleServerEvents.SYNC, (gameState: GameState) => {
            assert.deepEqual(gameState, handleJoinTableSpy.returnValues[0]);
            handleJoinTableSpy.restore();
            done();
        })
    })
})