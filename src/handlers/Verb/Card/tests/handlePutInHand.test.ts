import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { cardFactory, deckFactory, clientHandFactory } from '../../../../factories';
import { extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById } from '../../../../extractors/gameStateExtractors';
import { CardTypes } from '../../../../types/dataModelDefinitions';
import { client1 } from '../../../../mocks/client';
import { Container } from 'typescript-ioc';
import { CardVerbHandler } from '../CardVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${CardVerbTypes.PUT_IN_HAND} verb`, function() {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const client = client1;
    const cardBeingAddedToHand = cardFactory(0,0, CardTypes.FRENCH);
    client.grabbedEntitiy = {
        entityId: cardBeingAddedToHand.entityId,
        entityType: cardBeingAddedToHand.entityType,
        grabbedAtX: 15,
        grabbedAtY: 20
    }
    const verb: CardVerb = {
        type: CardVerbTypes.PUT_IN_HAND,
        clientId: client.clientInfo.clientId,
        positionX: 0,
        positionY: 0,
        entityId: cardBeingAddedToHand.entityId,
        entityType: cardBeingAddedToHand.entityType,
        
    } 

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(cardBeingAddedToHand.entityId, cardBeingAddedToHand);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(clientId))
        })
    })

    it('should add the grabbed card to the correct hand', function(){
        const {clientId} = client.clientInfo;
        const nextGameState = cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(nextGameState, clientId,cardBeingAddedToHand.entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', function() {  
        const nextGameState = cardVerbHandler.putInHand(verb);
        const grabbedEntitiy = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntitiy, null);
    })
    it('should take out correct card from cards array', function() {
        const nextGameState = cardVerbHandler.putInHand(verb);
        assert.equal(extractCardById(nextGameState ,cardBeingAddedToHand.entityId), undefined);
    })
})