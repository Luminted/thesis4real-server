import assert from 'assert';
import { ClientConnectionStatuses } from "../../../../types/socketTypes"
import { handleRejoinTable } from "./handleRejoinTable";
import { extractClientById } from '../../../../extractors/gameStateExtractors';
import { createClient } from '../../../../mocks/client';
import { Seats } from '../../../../types/dataModelDefinitions';
import { GameStateStore } from '../../../../Store/GameStateStore';

describe('Testing handleRejoinTable', function(){
    const clientId = 'client-1';
    let gameStateStore = new GameStateStore();

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const client = createClient(clientId, Seats.NORTH, false);
            draft.clients.set(clientId, client);
        })
    })

    it(`should set status to ${ClientConnectionStatuses.CONNECTED} client of given clientId`, function(){
        gameStateStore.changeState(draft => handleRejoinTable(draft, clientId));
        const rejoinedClient = extractClientById(gameStateStore.state, clientId);
        assert.equal(rejoinedClient.status, ClientConnectionStatuses.CONNECTED);
    });
})