import * as assert from 'assert';
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, CardTypes } from "../../../../types/dataModelDefinitions";
import { cardFactory } from "../../../../factories";
import { Container } from 'typescript-ioc';
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";
import { client1 } from "../../../../mocks/client";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
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
            const nextGameState = sharedVerbHandler.release(verb);

            const grabbedEntity =extractGrabbedEntityOfClientById(nextGameState, verb.clientId);
            assert.equal(grabbedEntity, null);
        })
        it('should set the grabbedBy to null on released entity', function(){
            const {entityId, entityType} = verb;
            
            const nextGameState = sharedVerbHandler.release(verb);

            const releasedEntity = extractEntityByTypeAndId(nextGameState, entityType, entityId);
            assert.equal(releasedEntity.grabbedBy, null);
        })
    })
})