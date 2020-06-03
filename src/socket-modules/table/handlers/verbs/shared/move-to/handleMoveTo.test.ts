import assert from 'assert';
import produce from 'immer';
import { SharedVerbTypes, SharedVerb } from '../../../../../../types/verbTypes';
import { GameState, EntityTypes, CardTypes } from '../../../../../../types/dataModelDefinitions';
import { createClient, createCard, createDeck } from '../../../../../../factories';
import { initialGameState } from '../../../../../../mocks/initialGameState';
import {handleMoveTo} from './handleMoveTo';
import { extractCardById, extractDeckById } from '../../../../../../extractors/gameStateExtractors';

describe(`handle ${SharedVerbTypes.MOVE_TO}`, function(){
    let gameState: GameState;
    let client = createClient('socket-1');
    const cardToMove = createCard(111,222, CardTypes.FRENCH);
    const deckToMove = createDeck(CardTypes.FRENCH, 222,111);


    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(cardToMove.entityId ,cardToMove);
            draft.decks.set(deckToMove.entityId, deckToMove);
            draft.clients.set(client.clientInfo.clientId ,client);
        })
    })

    it('should move the correct card to given position', function(){
        const verb: SharedVerb = {
            type: SharedVerbTypes.MOVE_TO,
            clientId: client.clientInfo.clientId,
            entityId: cardToMove.entityId,
            entityType: EntityTypes.CARD,
            positionX: 666,
            positionY: 777,
        }

        let nextGameState = handleMoveTo(gameState, verb);
        let movedCard = extractCardById(nextGameState, cardToMove.entityId);
        assert.equal(movedCard.positionX, verb.positionX);
        assert.equal(movedCard.positionY, verb.positionY);
    })

    it('should move the correct deck to given position', function(){
        const verb: SharedVerb = {
            type: SharedVerbTypes.MOVE_TO,
            clientId: client.clientInfo.clientId,
            entityId: deckToMove.entityId,
            entityType: EntityTypes.DECK,
            positionX: 888,
            positionY: 999,
        }

        let nextGameState = handleMoveTo(gameState, verb);
        let movedDeck = extractDeckById(nextGameState, deckToMove.entityId);
        assert.equal(movedDeck.positionX, verb.positionX);
        assert.equal(movedDeck.positionY, verb.positionY);
    })
})