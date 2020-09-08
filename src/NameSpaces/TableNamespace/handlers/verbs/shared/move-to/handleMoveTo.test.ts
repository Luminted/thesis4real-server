import * as assert from 'assert';
import { SharedVerbTypes, SharedVerb } from '../../../../../../types/verbTypes';
import { EntityTypes, CardTypes } from '../../../../../../types/dataModelDefinitions';
import { cardFactory, deckFactory } from '../../../../../../factories';
import {handleMoveTo} from './handleMoveTo';
import { extractCardById, extractDeckById } from '../../../../../../extractors/gameStateExtractors';
import { GameStateStore } from '../../../../../../Store/GameStateStore';
import { client1 } from '../../../../../../mocks/client';

describe(`handle ${SharedVerbTypes.MOVE_TO}`, function(){
    let gameStateStore = new GameStateStore();
    let client = client1;
    const cardToMove = cardFactory(111,222, CardTypes.FRENCH);
    const deckToMove = deckFactory(CardTypes.FRENCH, 222,111);


    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState( draft => {
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

        gameStateStore.changeState(draft => handleMoveTo(draft, verb));
        let movedCard = extractCardById(gameStateStore.state, cardToMove.entityId);
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

        gameStateStore.changeState(draft => handleMoveTo(draft, verb));
        let movedDeck = extractDeckById(gameStateStore.state, deckToMove.entityId);
        assert.equal(movedDeck.positionX, verb.positionX);
        assert.equal(movedDeck.positionY, verb.positionY);
    })
})