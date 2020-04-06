import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { clientFactory, cardFactory, deckFactory, clientHandFactory } from '../../../../factories';
import produce from 'immer';
import { handlePutInHand } from './handlePutInHand';
import { extractClientHandById, extractCardById, extractGrabbedEntityOfClientById } from '../../../../extractors';
import { initialGameState } from '../../../../__mocks__/initialGameState';
import { GameState, CardTypes } from '../../../../types/dataModelDefinitions';

describe(`handle ${CardVerbTypes.PUT_IN_HAND} verb`, function() {
    let gameState: GameState;
    let client = clientFactory('socket-1');
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
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardBeingAddedToHand, cardFactory(0,0, CardTypes.FRENCH), cardFactory(0,100, CardTypes.FRENCH), cardFactory(100,0, CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 10,12)]
            draft.clients.push(client);
            draft.hands = [clientHandFactory(client.clientInfo.clientId)];
        })
    })

    it('should add the grabbed card to the correct hand', function(){
        const nextGameState = handlePutInHand(gameState, verb);
        const clientHand = extractClientHandById(nextGameState, client.clientInfo.clientId);
        const cardPutInHand = clientHand.cards.find(c => c.entityId === cardBeingAddedToHand.entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', function() {
        const nextGameState = handlePutInHand(gameState, verb);
        const grabbedEntitiy = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntitiy, null);
    })
    it('should take out correct card from cards array', function() {
        const nextGameState = handlePutInHand(gameState, verb);
        assert.equal(extractCardById(nextGameState ,cardBeingAddedToHand.entityId), undefined);
    })
})