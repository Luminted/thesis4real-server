import produce from "immer";
import * as assert from 'assert';

import { handleRelease } from './handleRelease';
import { SharedVerbTypes, SharedVerb } from "../../../.././types/verbTypes";
import { GameState, EntityTypes, CardTypes } from "../../../.././types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory } from "../../../../factories";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";
import {initialGameState} from '../../../../mocks/initialGameState'


describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    const client = clientFactory('socket-1');
    const card = cardFactory(0,1,CardTypes.FRENCH);
    const verb: SharedVerb = {
        type: SharedVerbTypes.RELEASE,
        clientId: client.clientInfo.clientId,
        positionY: card.positionY,
        positionX: card.positionX,
        entityId: card.entityId,
        entityType: card.entityType
    }
    card.grabbedBy = client.clientInfo.clientId;
    let gameState: GameState;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(card.entityId, card);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('should set grabbedEntity to null for correct client.', function(){     
            const nextState = handleRelease(gameState,verb);
            const grabbedEntity =extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity, null);
        })
        it('should set the grabbedBy to null on released entity', function(){
            const {entityId, entityType} = verb;
            const nextState = handleRelease(gameState,verb);
            const releasedEntity = extractEntityByTypeAndId(nextState, entityType, entityId);
            assert.equal(releasedEntity.grabbedBy, null);
        })
    })
})