import assert from "assert";
import { Container } from "typescript-ioc";
import { extractClientById } from "../../../extractors/gameStateExtractors";
import { extractClientIdBySocketId } from "../../../extractors/tableStateExtractor";
import { mockClient1 } from "../../../mocks/clientMocks";
import { GameStateStore } from "../../../stores/gameStateStore";
import { TableStateStore } from "../../../stores/tableStateStore";
import { EClientConnectionStatuses, ETableClientEvents } from "../../../typings";
import { TableHandler } from "../TableHandler";

describe(`Event handler for: ${ETableClientEvents.CONNECT}`, () => {
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(GameStateStore);
    const tableStateStore = Container.get(TableStateStore);
    const {clientInfo: {clientId}} = mockClient1;
    const socketId = 'client-socket1';

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1, status: EClientConnectionStatuses.DISCONNECTED});
        })
        tableStateStore.changeState(draft => {
            draft.socketIdMapping[socketId] = clientId;
        })
    })

    it(`should set clinets connection status to ${EClientConnectionStatuses.CONNECTED} if client exists and it's connection status is ${EClientConnectionStatuses.DISCONNECTED}`, () =>{
        const nextState = tableHandler.rejoin(clientId, socketId);

        const {status} = extractClientById(nextState, clientId);
        assert.equal(status, EClientConnectionStatuses.CONNECTED);
    })
    it('should update socket-client ID mapping', () => {
        const newSocketId = 'client-socket2';

        tableHandler.rejoin(clientId, newSocketId);
    
        const {socketIdMapping} = tableStateStore.state;

        assert.equal(socketIdMapping[newSocketId], clientId);
        assert.equal(socketIdMapping[socketId], undefined);
       
    })

    it("should throw error if client with given id does not exist", () => {
        assert.throws(() => tableHandler.rejoin("whatever", socketId));
    })

    it(`should throw error if given clients status is ${EClientConnectionStatuses.CONNECTED}`, () => {
        const {clientInfo: {clientId}} = mockClient1;
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1, status: EClientConnectionStatuses.CONNECTED});
        })

        assert.throws(() => tableHandler.rejoin(clientId, socketId));
    })
})