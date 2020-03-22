import produce from "immer";
import * as assert from 'assert';

import { handleRelease } from './handleRelease';
import { SharedVerbTypes, SharedVerb } from "../../../.././types/verbTypes";
import { GameState, EntityTypes } from "../../../.././types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory } from "../../../../factories";
import { extractGrabbedEntityOfClientById } from "../../../../extractors";

describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    let client = clientFactory();

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0), cardFactory(0,100), cardFactory(100,0)]
            draft.decks = [deckFactory(10,10)]
            draft.clients.push(client);
        })
    })

    const testedVerbType = SharedVerbTypes.RELEASE; 
    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('Sets grabbedEntity to null for correct client.', function(){
            const entityType = EntityTypes.CARD;
            const entityId= EntityTypes.CARD + 1;
            const cursorX = 1;
            const cursorY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                cursorX,
                cursorY,
                entityId,
                entityType
            }
            const nextState = handleRelease(gameState,verb);
            const grabbedEntity =extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity, null);
        })
    })
})