import assert from 'assert'

import { TableModuleClientEvents, JoinTablePayload } from "../../../../types/sockeTypes";
import { createTable } from "../../createTable";
//TODO: dont use state here
import { initServerState, addTable, gameStateGetter, gameStateSetter } from "../../../../state";
import { handleJoinTable } from "./handleJoinTable";
import { PlayTable, GameState } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats, extractCardFromClientHandById, extractClientById, extractClientHandById } from '../../../../extractors/gameStateExtractors';


describe(`Socket handler for: ${TableModuleClientEvents.JOIN_TABLE}`, function(){
    let table: PlayTable;
    let gameState: GameState;
    const socketId = 'socket-1'
    const payload: JoinTablePayload = {
        socketId
    }
    
    beforeEach(() => {
        initServerState();
        table = createTable(1);
        addTable(table);
        gameState = gameStateGetter(table.tableId)();
    })

    it('should create client with sent socketId as clientId', function(){
        const nextState = handleJoinTable(gameState, payload);
        const client = extractClientById(nextState, socketId);
        assert.notEqual(client, undefined);
    })

    it('should create hand for client', function(){
        const nextState = handleJoinTable(gameState, payload);
        const hand = extractClientHandById(nextState, socketId);
        assert.notEqual(hand, undefined);
    })
    it('should assign the next empty seat to client and remove it from empty seats', function(){
        const emptySeats = extractEmptySeats(gameState);
        const nextSeat = emptySeats[emptySeats.length -1];
        const nextState = handleJoinTable(gameState, payload);
        const client = extractClientById(nextState, socketId);
        const nextStateEmptySeats = extractEmptySeats(nextState);
        assert.equal(client.clientInfo.seatedAt, nextSeat);
        assert.equal(nextStateEmptySeats.includes(nextSeat), false);
    })
})