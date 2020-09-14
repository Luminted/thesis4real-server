import * as assert from 'assert';
import { Container } from 'typescript-ioc';
import { SharedVerbTypes, SharedVerb } from '../../../../types/verbTypes';
import { EntityTypes, CardTypes } from '../../../../types/dataModelDefinitions';
import { cardFactory, deckFactory } from '../../../../factories';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../mocks/client';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${SharedVerbTypes.MOVE_TO}`, function(){
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
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

        const nextGameState = sharedVerbHandler.moveTo(verb);

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

        const nextGameState = sharedVerbHandler.moveTo(verb);

        let movedDeck = extractDeckById(nextGameState, deckToMove.entityId);
        assert.equal(movedDeck.positionX, verb.positionX);
        assert.equal(movedDeck.positionY, verb.positionY);
    })
})