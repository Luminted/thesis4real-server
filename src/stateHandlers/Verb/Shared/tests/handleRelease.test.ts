import assert from 'assert';
import { Container } from 'typescript-ioc';
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes } from "../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { SharedVerbHandler } from '../SharedVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { cardEntityMock1 } from '../../../../mocks/entityMocks';

describe(`handle ${SharedVerbTypes.RELEASE} verb`, function() {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const card = {...cardEntityMock1, grabbedBy: clientId};
    const verb: SharedVerb = {
        type: SharedVerbTypes.RELEASE,
        clientId:clientId,
        positionY: card.positionY,
        positionX: card.positionX,
        entityId: card.entityId,
        entityType: card.entityType
    }
    card.grabbedBy = clientId;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
       gameStateStore.changeState(draft => {
            draft.cards.set(card.entityId, card);
            draft.clients.set(clientId, {...mockClient1});
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