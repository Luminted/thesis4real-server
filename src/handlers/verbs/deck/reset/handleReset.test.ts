import * as assert from 'assert';
import {produce} from 'immer';

import { DeckVerbTypes, DeckVerb } from '../../../.././types/verbTypes';
import { GameState, EntityTypes, BaseCard, CardTypes } from '../../../.././types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory, clientHandFactory } from '../../../../factories';
import {handleReset} from './handleReset'
import {initialGameState} from '../../../../__mocks__/initialGameState'


describe(`handle ${DeckVerbTypes.RESET} verb`, function() {
    let gameState: GameState;
    const client = clientFactory('socket-1');
    const deck = deckFactory(CardTypes.FRENCH,100,100);
    const verbType = DeckVerbTypes.RESET;
    const cardsBelongingToDeck = [cardFactory(0,0,CardTypes.FRENCH,undefined, undefined, undefined, deck.entityId), cardFactory(0,100, CardTypes.FRENCH, undefined, undefined, undefined, deck.entityId)]

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [...cardsBelongingToDeck, cardFactory(100,0, CardTypes.FRENCH)]
            draft.decks = [deck]
            draft.clients.push(client);
            draft.hands.push(clientHandFactory(client.clientInfo.clientId));
            draft.hands[0].cards.push(cardFactory(0,0,CardTypes.FRENCH,undefined,undefined,undefined,deck.entityId))
        })
    })

    it('should remove all cards off the table belonging to the correct deck', function() {
        const verb: DeckVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: EntityTypes.DECK
        }

        const nextState = handleReset(gameState, verb);
        assert.equal(nextState.cards.some(card => card.ownerDeck === verb.entityId), false);
    })

    it('should remove all card out of player hands belonging to the correct deck', function(){
        const verb: DeckVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: EntityTypes.DECK
        }
        const nextState = handleReset(gameState, verb);
        assert.equal(nextState.hands.some(hand => hand.cards.some(card => card.ownerDeck === verb.entityId)), false)
    })

    it('should put all cards back to the deck', function(){
        const verb: DeckVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: EntityTypes.DECK
        }
        const nextState = handleReset(gameState, verb);
        for(const card of cardsBelongingToDeck){
            assert.notEqual(nextState.decks[0].cards.find(deckCard => deckCard.entityId === card.entityId), undefined);
        }
    })

})