import assert from 'assert';
import { Container } from 'typescript-ioc';
import { ClientConnectionStatuses, TableClientEvents } from "../../../types/socketTypes";
import { ClientHand, Client } from "../../../types/dataModelDefinitions";
import { extractClientById, extractEmptySeats } from "../../../extractors/gameStateExtractors";
import { clientHandFactory } from "../../../factories";
import { client1, createClient } from '../../../mocks/client';
import { ConnectionHandler } from '../ConnectionHandler';
import { TableStateStore } from '../../../stores/TableStateStore/TableStateStore';

describe(`Event handler for: ${TableClientEvents.DISCONNECT}`, function(){
    const connectionHandler = new ConnectionHandler();
    const tableStateStore = Container.get(TableStateStore);
    const gameStateStore = tableStateStore.state.gameStateStore;
    const client = client1;
    const {clientId} = client1.clientInfo;

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    it(`should set clients connection status to ${ClientConnectionStatuses.DISCONNECTED}`, () => {
        connectionHandler.disconnect(client.clientInfo.clientId);

        const disconnectedClinet = extractClientById(gameStateStore.state, clientId);
        assert.equal(disconnectedClinet.status, ClientConnectionStatuses.DISCONNECTED);
    })

    
})