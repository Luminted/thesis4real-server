import assert from 'assert';
import { Container } from 'typescript-ioc';
import { EClientConnectionStatuses, ETableClientEvents } from "../../../typings";
import { extractClientById } from "../../../extractors/gameStateExtractors";
import { mockClient1 } from '../../../mocks/clientMocks';
import { ConnectionHandler } from '../ConnectionHandler';
import { GameStateStore } from '../../../stores/GameStateStore';

describe(`Event handler for: ${ETableClientEvents.DISCONNECT}`, () => {
    const connectionHandler = new ConnectionHandler();
    const gameStateStore = Container.get(GameStateStore);
    const client = mockClient1;
    const {clientId} = mockClient1.clientInfo;

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    it(`should set clients connection status to ${EClientConnectionStatuses.DISCONNECTED}`, () => {
        connectionHandler.disconnect(client.clientInfo.clientId);

        const disconnectedClinet = extractClientById(gameStateStore.state, clientId);
        assert.equal(disconnectedClinet.status, EClientConnectionStatuses.DISCONNECTED);
    })
})