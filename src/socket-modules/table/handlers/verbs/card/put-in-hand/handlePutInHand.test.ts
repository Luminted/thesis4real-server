import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from '../../../../../../types/verbTypes';
import { clientFactory, cardFactory, deckFactory, clientHandFactory } from '../../../../../../factories';
import produce, { enableMapSet } from 'immer';
import { handlePutInHand } from './handlePutInHand';
import { extractClientHandById, extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById } from '../../../../../../extractors/gameStateExtractors';
import { initialGameState } from '../../../../../../mocks/initialGameState';
import { GameState, CardTypes } from '../../../../../../types/dataModelDefinitions';

describe(`handle ${CardVerbTypes.PUT_IN_HAND} verb`, function() {
    //enabling Map support for Immer
    enableMapSet();
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
        const {clientId} = client.clientInfo;
        gameState = produce(initialGameState, draft => {
            draft.cards.set(cardBeingAddedToHand.entityId, cardBeingAddedToHand);
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(clientId))
        })
    })

    it('should add the grabbed card to the correct hand', function(){
        const {clientId} = client.clientInfo;
        const nextGameState = handlePutInHand(gameState, verb);
        const cardPutInHand = extractCardFromClientHandById(nextGameState, clientId,cardBeingAddedToHand.entityId);
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
    it('should do nothing if it exists in a deck also. This is for avoiding duplication on deck RESET caused by concurrency.', function(){
        gameState = produce(gameState, draft => {
            const deck = deckFactory(CardTypes.FRENCH, 0,0);
            deck.cards.push(cardBeingAddedToHand);
            draft.cards.get(cardBeingAddedToHand.entityId).ownerDeck = deck.entityId;
            draft.decks.set(deck.entityId, deck);
        })
        const nextGameState = handlePutInHand(gameState, verb);
        assert.deepEqual(nextGameState, gameState);
    })
})