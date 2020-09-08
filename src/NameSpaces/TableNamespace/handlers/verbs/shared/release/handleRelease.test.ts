import * as assert from 'assert';

import { handleRelease } from './handleRelease';
import { SharedVerbTypes, SharedVerb } from "../../../../../../types/verbTypes";
import { EntityTypes, CardTypes } from "../../../../../../types/dataModelDefinitions";
import { cardFactory } from "../../../../../../factories";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../../../extractors/gameStateExtractors";
import { client1 } from "../../../../../../mocks/client";
import { GameStateStore } from "../../../../../../Store/GameStateStore";


describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    const gameStateStore = new GameStateStore();
    const client = client1;
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

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
       gameStateStore.changeState(draft => {
            draft.cards.set(card.entityId, card);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('should set grabbedEntity to null for correct client.', function(){     
            gameStateStore.changeState(draft => handleRelease(draft,verb));
            const grabbedEntity =extractGrabbedEntityOfClientById(gameStateStore.state, verb.clientId);
            assert.equal(grabbedEntity, null);
        })
        it('should set the grabbedBy to null on released entity', function(){
            const {entityId, entityType} = verb;
            gameStateStore.changeState(draft => handleRelease(draft,verb));
            const releasedEntity = extractEntityByTypeAndId(gameStateStore.state, entityType, entityId);
            assert.equal(releasedEntity.grabbedBy, null);
        })
    })
})