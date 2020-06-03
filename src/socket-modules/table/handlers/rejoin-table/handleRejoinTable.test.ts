import assert from 'assert';
import { ClientConnectionStatuses } from "../../../../types/socketTypes"
import { GameState } from "../../../../types/dataModelDefinitions";
import produce, { enableMapSet } from "immer";
import { initialGameState } from "../../../../mocks/initialGameState";
import { createClient } from "../../../../factories";
import { handleRejoinTable } from "./handleRejoinTable";
import { extractClientById } from '../../../../extractors/gameStateExtractors';

describe('Testing handleRejoinTable', function(){
    //Enabling Map support for Immer
    enableMapSet()

    const clientId = 'client-1';
    let gameState: GameState;

    beforeEach(() => {
        gameState = produce(initialGameState, draft => {
            const client = createClient(clientId);
            client.status = ClientConnectionStatuses.DISCONNECTED;
            draft.clients.set(clientId, client);
        })
    })

    it(`should set status to ${ClientConnectionStatuses.CONNECTED} client of given clientId`, function(){
        const nextGameState = handleRejoinTable(gameState, clientId);
        const rejoinedClient = extractClientById(nextGameState, clientId);
        assert.equal(rejoinedClient.status, ClientConnectionStatuses.CONNECTED);
    });
})