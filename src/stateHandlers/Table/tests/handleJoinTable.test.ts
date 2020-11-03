import assert from 'assert'
import { TableClientEvents, ClientConnectionStatuses } from "../../../types/socketTypes";
import { extractClientById, extractClientHandById } from '../../../extractors/gameStateExtractors';
import { TableHandler } from '../TableHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../stores/TableStateStore/TableStateStore';
import { extractEmptySeats } from '../../../extractors/tableStateExtractor';


describe(`Socket handler for: ${TableClientEvents.JOIN_TABLE}`, function(){
    const tableHandler = new TableHandler();
    const tableStateStore = Container.get(TableStateStore);
    const gameStateStore = tableStateStore.state.gameStateStore;
    const clientId = 'client-1';
    
    beforeEach(() => {
        gameStateStore.resetState();
    })

    it('should create client with given clientId', function(){
        const nextGameState = tableHandler.joinTable(clientId);

        const client = extractClientById(nextGameState, clientId);
        assert.notEqual(client, undefined);
    })

    it('should create hand for client', function(){
        const nextGameState = tableHandler.joinTable(clientId);

        const hand = extractClientHandById(nextGameState, clientId);
        assert.notEqual(hand, undefined);
    })
    it('should assign the next empty seat to client and remove it from empty seats', function(){
        const emptySeats = extractEmptySeats(tableStateStore.state);
        const nextSeat = emptySeats[emptySeats.length -1];
        
        const nextGameState = tableHandler.joinTable(clientId);

        const client = extractClientById(nextGameState, clientId);
        const nextGameStateEmptySeats = extractEmptySeats(tableStateStore.state);
        assert.equal(client.clientInfo.seatId, nextSeat);
        assert.equal(nextGameStateEmptySeats.includes(nextSeat), false);
    })
    it(`should create client with status ${ClientConnectionStatuses.CONNECTED}`, function(){
        const nextGameState = tableHandler.joinTable(clientId);

        const createdClient = extractClientById(nextGameState, clientId);
        assert.equal(createdClient.status, ClientConnectionStatuses.CONNECTED);
    })
})