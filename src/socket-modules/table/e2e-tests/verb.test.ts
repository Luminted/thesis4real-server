import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import assert from 'assert';
import {spy} from 'sinon';


import { TableModule } from '../tableModule';
import { TableModuleClientEvents, TableModuleServerEvents, JoinTablePayload } from '../../../types/sockeTypes';
import { createTable } from '../createTable';
import { initServerState, addTable, gameStateGetter } from '../../../state';
import { PlayTable, EntityTypes, GameState } from '../../../types/dataModelDefinitions';
import * as verbHandler from '../../../handlers/verbs'
import { Verb, SharedVerbTypes } from '../../../types/verbTypes';

describe(`Event: ${TableModuleClientEvents.VERB}`, function(){
    const url = 'http://localhost';
    const port = 4001;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableModule = TableModule(socketServer);
    let getGameState: () => GameState;
    let socket: SocketIOClient.Socket;
    let playTable: PlayTable;
    let verb: Verb;

    this.beforeEach((done)=> {
        initServerState();
        playTable = createTable(1);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable);
        socket = SocketIOClient(`${url}:${port}${namespace}`, {
            query: {
                tableId: playTable.tableId
            }
        });
        socket.on('connect', () => {
            console.log(`connected to ${url}${namespace}`)
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
        socketServer.close(() => {
        });
    })
        

    this.beforeEach(() => {
        verb = {
            clientId: socket.id,
            entityId: 'entity01',
            entityType: EntityTypes.CARD,
            positionX: 0,
            positionY: 0,
            type: SharedVerbTypes.MOVE
        }
    });

    it(`should call handleVerb with received verb`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        socket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[1], verb);
            handleVerbSpy.restore();
            done();
        });
    })

    it(`should call handleVerb with gamestate belonging to table`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        const {gameState} = playTable;
        socket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[0], gameState);
            handleVerbSpy.restore();
            done();
        });
    })

    it(`should call handleVerb with recevied payload`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        socket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[1], verb);
            handleVerbSpy.restore();
            done();
        });
    })

    it('should set state with result of handleVerb', function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        socket.emit(TableModuleClientEvents.VERB, verb, () => {
            assert.equal(getGameState(), handleVerbSpy.returnValues[0]);
            handleVerbSpy.restore();
            done();
        })
    })
    it(`should emit ${TableModuleServerEvents.SYNC} with the result of handleVerb`, function(done){
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        socket.emit(TableModuleClientEvents.JOIN_TABLE, {socketId: socket.id});
        socket.once(TableModuleServerEvents.SYNC, () => {
            socket.emit(TableModuleClientEvents.VERB, verb);
            socket.once(TableModuleServerEvents.SYNC, (gameState: GameState) => {
                assert.deepEqual(gameState, handleVerbSpy.returnValues[0]);
                done();
            })
        })
    })
    it('should call acknowledgement function if given', function(done){
        socket.emit(TableModuleClientEvents.VERB, verb, () =>{
            done();
        })
    })
})