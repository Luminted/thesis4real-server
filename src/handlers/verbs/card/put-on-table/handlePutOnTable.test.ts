import * as assert from 'assert';
import {handlePutOnTable} from './handlePutOnTable';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { GameState, EntityTypes, CardTypes, CardRepresentation } from '../../../../types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory, clientHandFactory, cardRepFactory } from '../../../../factories';
import { initialGameState } from '../../../../mocks/initialGameState';
import produce, { enableMapSet } from 'immer';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractCardFromClientHandById, extractCardFromDeckById } from '../../../../extractors/gameStateExtractors';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    //Enabling Map support for Immer
    enableMapSet();
    let gameState: GameState;
    let client = clientFactory('socket-1');
    let cardToPutOnTable: CardRepresentation;
    let verb: CardVerb;

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        cardToPutOnTable = cardRepFactory(CardTypes.FRENCH, 'placeholder');
        verb = {
            clientId: client.clientInfo.clientId,
            entityId: cardToPutOnTable.entityId,
            entityType: EntityTypes.CARD,
            positionX: 99,
            positionY: 66,
            type: CardVerbTypes.PUT_ON_TABLE
        };
        gameState = produce(initialGameState, draft => {
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(client.clientInfo.clientId));
            draft.hands.get(clientId).cards.push(cardToPutOnTable);
        })
    })

    it('should add card to cards array', function(){
        let nextGameState = handlePutOnTable(gameState, verb);
        let cardOnTable = extractCardById(nextGameState, cardToPutOnTable.entityId);
        assert.notEqual(cardOnTable, undefined);
    });

    it('should put it on the given position', function(){
        let nextGameState = handlePutOnTable(gameState, verb);
        let cardOnTable = extractCardById(nextGameState, cardToPutOnTable.entityId);
        assert.equal(cardOnTable.positionX, verb.positionX);
        assert.equal(cardOnTable.positionY, verb.positionY);
    })

    it('should remove card from hand of correct client', function() {
        let nextGameState = handlePutOnTable(gameState, verb);
        let nextHand = extractClientHandById(nextGameState, client.clientInfo.clientId);
        assert.notEqual(nextHand.cards.find(card => card.entityId === cardToPutOnTable.entityId), undefined);
    })

    it('should set grabbed entity to null', function(){
        let nextGameState = handlePutOnTable(gameState, verb);
        let grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntity, null);
    })
    it('should do nothing if it exists in a deck also. This is for avoiding duplication caused by concurrency.', function(){
        gameState = produce(gameState, draft => {
            const deck = deckFactory(CardTypes.FRENCH, 0,0);
            deck.cards.push(cardToPutOnTable);
            draft.decks.set(deck.entityId, deck);
            extractCardFromClientHandById(draft, client.clientInfo.clientId, cardToPutOnTable.entityId).ownerDeck = deck.entityId;
        })
        const nextGameState = handlePutOnTable(gameState, verb);
        assert.deepEqual(nextGameState, gameState);
    })
    
})