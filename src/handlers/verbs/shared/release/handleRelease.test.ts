import produce from "immer";
import * as assert from 'assert';

import { handleRelease } from './handleRelease';
import { SharedVerbTypes, SharedVerb } from "../../../.././types/verbTypes";
import { GameState, EntityTypes, CardTypes } from "../../../.././types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory } from "../../../../factories";
import { extractGrabbedEntityOfClientById } from "../../../../extractors";
import {initialGameState} from '../../../../__mocks__/initialGameState'


describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    let gameState: GameState;
    let client = clientFactory('socket-1');

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0, CardTypes.FRENCH), cardFactory(0,100, CardTypes.FRENCH), cardFactory(100,0, CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 10,10)]
            draft.clients.push(client);
        })
    })

    const testedVerbType = SharedVerbTypes.RELEASE; 
    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('Sets grabbedEntity to null for correct client.', function(){
            const entityType = EntityTypes.CARD;
            const entityId= EntityTypes.CARD + 1;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }
            const nextState = handleRelease(gameState,verb);
            const grabbedEntity =extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity, null);
        })
    })
})