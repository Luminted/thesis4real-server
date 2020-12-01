import assert from 'assert';
import { Container } from 'typescript-ioc';
import { IMoveToVerb, IMoveVerb, SharedVerbTypes } from '../../../../types/verb';
import { EntityTypes } from '../../../../types/dataModelDefinitions';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { cardEntityMock1, deckEntityMock1 } from '../../../../mocks/entityMocks';

describe(`handle ${SharedVerbTypes.MOVE_TO}`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
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
            type: SharedVerbTypes.MOVE_TO,
            entityId: cardEntityId,
            entityType: EntityTypes.CARD,
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
            type: SharedVerbTypes.MOVE_TO,
            entityId: deckEntityId,
            entityType: EntityTypes.DECK,
            positionX: 888,
            positionY: 999,
        }

        const nextGameState = sharedVerbHandler.moveTo(verb);

        let movedDeck = extractDeckById(nextGameState, deckEntityId);
        assert.equal(movedDeck.positionX, verb.positionX);
        assert.equal(movedDeck.positionY, verb.positionY);
    })
})