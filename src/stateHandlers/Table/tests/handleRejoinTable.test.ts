import assert from "assert";
import { Container } from "typescript-ioc";
import { extractClientById } from "../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../mocks/clientMocks";
import { GameStateStore } from "../../../stores/GameStateStore";
import { EClientConnectionStatuses, ETableClientEvents } from "../../../typings";
import { TableHandler } from "../TableHandler";

describe(`Event handler for: ${ETableClientEvents.CONNECT}`, () => {
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(GameStateStore);

    beforeEach(() => {
        gameStateStore.resetState();
    })

    it(`should set clinets connection status to ${EClientConnectionStatuses.CONNECTED} if client exists and it's connection status is ${EClientConnectionStatuses.DISCONNECTED}`, () =>{
        const {clientInfo: {clientId}} = mockClient1;
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1, status: EClientConnectionStatuses.DISCONNECTED});
        })

        const nextState = tableHandler.rejoin(clientId);

        const {status} = extractClientById(nextState, clientId);
        assert.equal(status, EClientConnectionStatuses.CONNECTED);
    })

    it("should throw error if client with given id does not exist", () => {
        assert.throws(() => tableHandler.rejoin("whatever"));
    })

    it(`should throw error if given clients status is ${EClientConnectionStatuses.CONNECTED}`, () => {
        const {clientInfo: {clientId}} = mockClient1;
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1, status: EClientConnectionStatuses.CONNECTED});
        })

        assert.throws(() => tableHandler.rejoin(clientId));
    })
})