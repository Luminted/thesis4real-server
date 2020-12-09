import assert from 'assert'
import { ETableClientEvents, EClientConnectionStatuses } from "../../../typings";
import { extractClientById, extractClientHandById } from '../../../extractors/gameStateExtractors';
import { TableHandler } from '../TableHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../stores/TableStateStore/TableStateStore';
import { GameStateStore } from '../../../stores/GameStateStore';
import { extractClientIdBySocketId } from '../../../extractors/tableStateExtractor';


describe(`Socket handler for: ${ETableClientEvents.JOIN_TABLE}`, () => {
    const tableHandler = new TableHandler();
    const tableStateStore = Container.get(TableStateStore);
    const gameStateStore = Container.get(GameStateStore);
    const socketId = 'socket-client-1';
    const requestedSeatId = "1"; 
    
    beforeEach(() => {
        tableStateStore.resetState();
        gameStateStore.resetState();
    })

    it('should create new client', () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, socketId);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        const client = extractClientById(nextGameState, clientId);
        assert.notEqual(client, undefined);
    })

    it('should create hand for client', () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, socketId);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        const hand = extractClientHandById(nextGameState, clientId);
        assert.notEqual(hand, undefined);
    })
    it("should assign requested seat ID for created client", () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, socketId);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        const {clientInfo: {seatId}} = extractClientById(nextGameState, clientId);
        assert.equal(seatId, requestedSeatId);
    })
    it("should create client with given name", () => {
        const givenName = "Johnny boi";

        tableHandler.joinTable(requestedSeatId, socketId, givenName);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        const {clientInfo: {name}} = extractClientById(gameStateStore.state, clientId);
        assert(name, givenName);
    })
    it("should throw error if requested seat is not empty", () => {
        tableStateStore.changeState(draft => {
            draft.emptySeats = draft.emptySeats.filter(seatId => seatId !== requestedSeatId);
        })

        assert.throws(() => tableHandler.joinTable(requestedSeatId, socketId));
    })
    it('should remove assigned seat from empty seats', () => {
        tableHandler.joinTable(requestedSeatId, socketId);

       const {emptySeats} = tableStateStore.state;
        assert.equal(emptySeats.some(seatId => seatId === requestedSeatId), false);
    })
    it(`should create client with status ${EClientConnectionStatuses.CONNECTED}`, () => {
        const nextGameState = tableHandler.joinTable(requestedSeatId, socketId);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        const createdClient = extractClientById(nextGameState, clientId);
        assert.equal(createdClient.status, EClientConnectionStatuses.CONNECTED);
    })
    it("should throw error if cient is already present", () => {
        tableStateStore.changeState(draft => {
            draft.socketIdMapping[socketId] = "client-1";
        })

        assert.throws(() => tableHandler.joinTable(requestedSeatId, socketId));
    })
    it("should map clients socket ID to client ID", () => {
        tableHandler.joinTable(requestedSeatId, socketId);

        const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
        assert.notEqual(clientId, undefined);
    })
})