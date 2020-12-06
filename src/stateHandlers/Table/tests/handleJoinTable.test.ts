import assert from 'assert'
import { ETableClientEvents, EClientConnectionStatuses } from "../../../typings";
import { extractClientById, extractClientHandById } from '../../../extractors/gameStateExtractors';
import { TableHandler } from '../TableHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../stores/TableStateStore/TableStateStore';
import { mockClient1 } from '../../../mocks/clientMocks';
import { GameStateStore } from '../../../stores/GameStateStore';


describe(`Socket handler for: ${ETableClientEvents.JOIN_TABLE}`, () => {
    const tableHandler = new TableHandler();
    const tableStateStore = Container.get(TableStateStore);
    const gameStateStore = Container.get(GameStateStore);
    const clientId = 'client-1';
    const requestedSeatId = "1"; 
    
    beforeEach(() => {
        tableStateStore.resetState();
        gameStateStore.resetState();
    })

    it('should create new client', () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, clientId);

        const client = extractClientById(nextGameState, clientId);
        assert.notEqual(client, undefined);
    })

    it('should create hand for client', () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, clientId);

        const hand = extractClientHandById(nextGameState, clientId);
        assert.notEqual(hand, undefined);
    })
    it("should set requested seat ID for created client", () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, clientId);

        const {clientInfo: {seatId}} = extractClientById(nextGameState, clientId);
        assert.equal(seatId, requestedSeatId);
    })
    it("should throw error if requested seat is not empty", () => {
        tableStateStore.changeState(draft => {
            draft.emptySeats = draft.emptySeats.filter(seatId => seatId !== requestedSeatId);
        })

        assert.throws(() => tableHandler.joinTable(requestedSeatId, clientId));
    })
    it('should remove assigned seat from empty seats', () => {
        tableHandler.joinTable(requestedSeatId, clientId);

       const {emptySeats} = tableStateStore.state;
        assert.equal(emptySeats.some(seatId => seatId === requestedSeatId), false);
    })
    it(`should create client with status ${EClientConnectionStatuses.CONNECTED}`, () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, clientId);

        const createdClient = extractClientById(nextGameState, clientId);
        assert.equal(createdClient.status, EClientConnectionStatuses.CONNECTED);
    })
    it("should throw error if cient is already present", () => {
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })

        assert.throws(() => tableHandler.joinTable(requestedSeatId, clientId));
    })
})