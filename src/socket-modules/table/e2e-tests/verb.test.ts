import SocketIOClient from 'socket.io-client'
import SocketIO from 'socket.io';
import assert from 'assert';
import {spy} from 'sinon';


import { TableModule } from '../tableModule';
import { TableModuleClientEvents, TableModuleServerEvents, JoinTablePayload } from '../../../types/sockeTypes';
import { createTable } from '../createTable';
import { initServerState, addTable, gameStateGetter } from '../../../state';
import { PlayTable, EntityTypes, GameState, SerializedGameState } from '../../../types/dataModelDefinitions';
import { Verb, SharedVerbTypes } from '../../../types/verbTypes';
import * as verbHandler from '../../../handlers/verbs'
import * as utils from '../utils/';

describe(`Event: ${TableModuleClientEvents.VERB}`, function(){
    const url = 'http://localhost';
    const port = 4001;
    const socketServer = SocketIO.listen(port);
    const namespace = '/table';
    const tableModule = TableModule(socketServer);
    let getGameState: () => GameState;
    let clientSocket: SocketIOClient.Socket;
    let playTable: PlayTable;
    let verb: Verb;

    beforeEach((done)=> {
        initServerState();
        playTable = createTable(1);
        getGameState = gameStateGetter(playTable.tableId);
        addTable(playTable);
        clientSocket = SocketIOClient(`${url}:${port}${namespace}`, {
            query: {
                tableId: playTable.tableId
            }
        });
        clientSocket.on('connect', () => {
            done();
        })
    })

    afterEach((done) => {
        if(clientSocket.connected){
            clientSocket.disconnect();
            setTimeout(done, 500)
        }
    })

    this.afterAll(() => {
        socketServer.close(() => {
        });
    })
        

    beforeEach(() => {
        verb = {
            clientId: clientSocket.id,
            entityId: 'entity01',
            entityType: EntityTypes.CARD,
            positionX: 0,
            positionY: 0,
            type: SharedVerbTypes.MOVE
        }
    });

    it(`should call handleVerb with received verb`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        clientSocket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[1], verb);
            handleVerbSpy.restore();
            done();
        });
    })

    it(`should call handleVerb with gamestate belonging to table`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        const {gameState} = playTable;
        clientSocket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[0], gameState);
            handleVerbSpy.restore();
            done();
        });
    })

    it(`should call handleVerb with recevied verb`, function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        clientSocket.emit(TableModuleClientEvents.VERB, verb, ()=>{
            assert.equal(handleVerbSpy.called, true);
            assert.deepEqual(handleVerbSpy.getCall(0).args[1], verb);
            handleVerbSpy.restore();
            done();
        });
    })

    it('should set state with result of handleVerb', function(done) {
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        clientSocket.emit(TableModuleClientEvents.VERB, verb, () => {
            assert.equal(getGameState(), handleVerbSpy.returnValues[0]);
            handleVerbSpy.restore();
            done();
        })
    })
    it(`should emit ${TableModuleServerEvents.SYNC} with the result of serializeGameState called with the result of handleVerb`, function(done){
        const handleVerbSpy = spy(verbHandler, 'handleVerb');
        const serializeGameStateSpy = spy(utils, 'serializeGameState');
        clientSocket.once(TableModuleServerEvents.SYNC, (gameState: SerializedGameState) => {
            let handlerResult = handleVerbSpy.returnValues[0];
            assert.equal(serializeGameStateSpy.calledWith(handlerResult), true);
            assert.deepEqual(gameState, serializeGameStateSpy.returnValues[0]);
            handleVerbSpy.restore();
            serializeGameStateSpy.restore();
            done();
        })
        clientSocket.emit(TableModuleClientEvents.JOIN_TABLE, () => {
            clientSocket.emit(TableModuleClientEvents.VERB, verb);
        });
    })
    it('should call acknowledgement function if given', function(done){
        clientSocket.emit(TableModuleClientEvents.VERB, verb, () =>{
            done();
        })
    })
})