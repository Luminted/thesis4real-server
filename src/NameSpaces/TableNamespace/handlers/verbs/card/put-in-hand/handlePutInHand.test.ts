import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../../../types/verbTypes';
import { cardFactory, deckFactory, clientHandFactory } from '../../../../../../factories';
import { handlePutInHand } from './handlePutInHand';
import { extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById } from '../../../../../../extractors/gameStateExtractors';
import { CardTypes } from '../../../../../../types/dataModelDefinitions';
import { GameStateStore } from '../../../../../../Store/GameStateStore';
import { client1 } from '../../../../../../mocks/client';

describe(`handle ${CardVerbTypes.PUT_IN_HAND} verb`, function() {
    let gameStateStateStore = new GameStateStore();
    let client = client1;
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
        gameStateStateStore.resetState();
        gameStateStateStore.changeState(draft => {
            draft.cards.set(cardBeingAddedToHand.entityId, cardBeingAddedToHand);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(clientId))
        })
    })

    it('should add the grabbed card to the correct hand', function(){
        const {clientId} = client.clientInfo;
       gameStateStateStore.changeState(draft => handlePutInHand(draft, verb));
        const cardPutInHand = extractCardFromClientHandById(gameStateStateStore.state, clientId,cardBeingAddedToHand.entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', function() {  
       gameStateStateStore.changeState(draft => handlePutInHand(draft, verb));
        const grabbedEntitiy = extractGrabbedEntityOfClientById(gameStateStateStore.state, client.clientInfo.clientId);
        assert.equal(grabbedEntitiy, null);
    })
    it('should take out correct card from cards array', function() {
       gameStateStateStore.changeState(draft => handlePutInHand(draft, verb));
        assert.equal(extractCardById(gameStateStateStore.state ,cardBeingAddedToHand.entityId), undefined);
    })
    it('should do nothing if it exists in a deck also. This is for avoiding duplication on deck RESET caused by concurrency.', function(){
        gameStateStateStore.changeState(draft => {
            const deck = deckFactory(CardTypes.FRENCH, 0,0);
            deck.cards.push(cardBeingAddedToHand);
            draft.cards.get(cardBeingAddedToHand.entityId).ownerDeck = deck.entityId;
            draft.decks.set(deck.entityId, deck);
        })

        const originalState = {...gameStateStateStore.state}

       gameStateStateStore.changeState(draft => handlePutInHand(draft, verb));
        assert.deepEqual(gameStateStateStore.state, originalState);
    })
})