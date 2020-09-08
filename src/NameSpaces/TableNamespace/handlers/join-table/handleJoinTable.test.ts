import assert from 'assert'

import { TableClientEvents, JoinTablePayload, ClientConnectionStatuses } from "../../../../types/socketTypes";
//TODO: dont use state here
import { handleJoinTable } from "./handleJoinTable";
import { CardTable, GameState } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats, extractClientById, extractClientHandById } from '../../../../extractors/gameStateExtractors';


describe(`Socket handler for: ${TableClientEvents.JOIN_TABLE}`, function(){
    // let table: CardTable;
    // let gameState: GameState;
    // const clientId = 'client-1'
    
    // beforeEach(() => {
    //     initServerState();
    //     [table, gameState] = createTable(0,0);
    //     addTable(table, gameState);
    // })

    // it('should create client with given clientId', function(){
    //     const nextState = handleJoinTable(gameState, clientId);
    //     const client = extractClientById(nextState, clientId);
    //     assert.notEqual(client, undefined);
    // })

    // it('should create hand for client', function(){
    //     const nextState = handleJoinTable(gameState, clientId);
    //     const hand = extractClientHandById(nextState, clientId);
    //     assert.notEqual(hand, undefined);
    // })
    // it('should assign the next empty seat to client and remove it from empty seats', function(){
    //     const emptySeats = extractEmptySeats(gameState);
    //     const nextSeat = emptySeats[emptySeats.length -1];
    //     const nextState = handleJoinTable(gameState, clientId);
    //     const client = extractClientById(nextState, clientId);
    //     const nextStateEmptySeats = extractEmptySeats(nextState);
    //     assert.equal(client.clientInfo.seatedAt, nextSeat);
    //     assert.equal(nextStateEmptySeats.includes(nextSeat), false);
    // })
    // it(`should create client with status ${ClientConnectionStatuses.CONNECTED}`, function(){
    //     const nextState = handleJoinTable(gameState, clientId);
    //     const createdClient = extractClientById(nextState, clientId);
    //     assert.equal(createdClient.status, ClientConnectionStatuses.CONNECTED);
    // })
})