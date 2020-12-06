import assert from 'assert';
import { Container } from 'typescript-ioc';
import { IMoveToVerb, ESharedVerbTypes, EEntityTypes } from '../../../../typings';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { cardEntityMock1, deckEntityMock1 } from '../../../../mocks/entityMocks';
import { GameStateStore } from '../../../../stores/GameStateStore';

describe(`handle ${ESharedVerbTypes.MOVE_TO}`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(GameStateStore)
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId: cardEntityId} = cardEntityMock1;
    const {entityId: deckEntityId} = deckEntityMock1;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState( draft => {
            draft.cards.set(cardEntityId ,{...cardEntityMock1});
            draft.decks.set(deckEntityId, {...deckEntityMock1});
            draft.clients.set(clientId ,{...mockClient1});
        })
    })

    it('should move the correct card to given position', () => {
        const verb: IMoveToVerb = {
            type: ESharedVerbTypes.MOVE_TO,
            entityId: cardEntityId,
            entityType: EEntityTypes.CARD,
            positionX: 666,
            positionY: 777,
        }

        const nextGameState = sharedVerbHandler.moveTo(verb);

        let movedCard = extractCardById(nextGameState, cardEntityId);
        assert.equal(movedCard.positionX, verb.positionX);
        assert.equal(movedCard.positionY, verb.positionY);
    })

    it('should move the correct deck to given position', () => {
        const verb: IMoveToVerb = {
            type: ESharedVerbTypes.MOVE_TO,
            entityId: deckEntityId,
            entityType: EEntityTypes.DECK,
            positionX: 888,
            positionY: 999,
        }

        const nextGameState = sharedVerbHandler.moveTo(verb);

        let movedDeck = extractDeckById(nextGameState, deckEntityId);
        assert.equal(movedDeck.positionX, verb.positionX);
        assert.equal(movedDeck.positionY, verb.positionY);
    })
})