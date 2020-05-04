import assert from 'assert'

import { TableModuleClientEvents, JoinTablePayload } from "../../../../types/sockeTypes";
import { createTable } from "../../createTable";
//TODO: dont use state here
import { initServerState, addTable, gameStateGetter, gameStateSetter } from "../../../../state";
import { handleJoinTable } from "./handleJoinTable";
import { PlayTable, GameState } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats } from '../../../../extractors/gameStateExtractors';


describe(`Socket handler for: ${TableModuleClientEvents.JOIN_TABLE}`, function(){
    let table: PlayTable;
    let gameState: GameState;
    const payload: JoinTablePayload = {
        socketId: 'socket-1'
    }
    
    this.beforeEach(() => {
        initServerState();
        table = createTable(1);
        addTable(table);
        gameState = gameStateGetter(table.tableId)();
    })

    it('should create client to proper table', function(){
        const nextState = handleJoinTable(gameState, payload);
        const client = nextState.clients[0];
        assert.notEqual(client, undefined);
    })

    it('should create hand for client', function(){
        const nextState = handleJoinTable(gameState, payload);
        const client = nextState.clients[0];
        const hand = nextState.hands[0];
        assert.equal(client.clientInfo.clientId, hand.clientId);
    })
    it('should assign the next empty seat to client and remove it from empty seats', function(){
        const nextSeat = extractEmptySeats(gameState)[0];
        const nextState = handleJoinTable(gameState, payload);
        const client = nextState.clients[0];
        const nextStateEmptySeats = extractEmptySeats(nextState);
        assert.equal(client.clientInfo.seatedAt, nextSeat);
        assert.equal(nextStateEmptySeats.some(seat => seat === nextSeat), false);
    })
    it('should create client with socketId in payload', function(){
        const nextState = handleJoinTable(gameState, payload);
        const client = nextState.clients[0];
        assert.equal(client.clientInfo.clientId, payload.socketId);
    })
})