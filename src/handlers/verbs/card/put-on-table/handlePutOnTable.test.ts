import * as assert from 'assert';
import {handlePutOnTable} from './handlePutOnTable';
import { CardVerbTypes, CardVerb } from '../../../../types/verbTypes';
import { GameState, EntityTypes, CardTypes } from '../../../../types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory, clientHandFactory, baseCardFactory } from '../../../../factories';
import { initialGameState } from '../../../../__mocks__/initialGameState';
import produce from 'immer';
import { extractCardById, extractGrabbedEntityOfClientById, extractClientHandById } from '../../../../extractors/gameStateExtractors';

describe(`handle ${CardVerbTypes.PUT_ON_TABLE} verb`, function() {
    let gameState: GameState;
    let client = clientFactory('socket-1');
    let cardToPutOnTable = baseCardFactory(CardTypes.FRENCH, 'placeholder');
    let verb: CardVerb = {
        clientId: client.clientInfo.clientId,
        entityId: cardToPutOnTable.entityId,
        entityType: EntityTypes.CARD,
        positionX: 99,
        positionY: 66,
        type: CardVerbTypes.PUT_ON_TABLE
    }

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0,CardTypes.FRENCH), cardFactory(0,100,CardTypes.FRENCH), cardFactory(100,0,CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 10,12)]
            draft.clients.push(client);
            draft.hands = [clientHandFactory(client.clientInfo.clientId)];
            draft.hands[0].cards.push(cardToPutOnTable);
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
        assert.equal(nextHand.cards.some(card => card.entityId !== cardToPutOnTable.entityId), false);
    })

    it('should set grabbed entity to null', function(){
        let nextGameState = handlePutOnTable(gameState, verb);
        let grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntity, null);
    })
})