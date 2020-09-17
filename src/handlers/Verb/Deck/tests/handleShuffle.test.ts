import assert from "assert";
import { Container } from "typescript-ioc";
import { extractDeckById } from "../../../../extractors/gameStateExtractors";
import { deckEntityMock } from "../../../../mocks/entity";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { DeckVerb, DeckVerbTypes } from "../../../../types/verbTypes";
import { DeckVerbHandler } from "../DeckVerbHandler";

describe(`handling ${DeckVerbTypes.SHUFFLE}`, () => {

    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {entityId, entityType} = deckEntityMock;
    const verb: DeckVerb = {
        entityId,
        entityType,
        type: DeckVerbTypes.SHUFFLE,
        clientId: 'client',
        positionX: 0,
        positionY: 0,
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(entityId, deckEntityMock);
        })
    })

    it('should only shuffle the rest of the deck', () => {
        const drawIndex = 14;
        const intactPart = deckEntityMock.cards.slice(0, 14);
        gameStateStore.changeState(draft => {
            extractDeckById(draft, entityId).drawIndex = drawIndex;
        });

        const nextGameState = deckVerbHandler.shuffle(verb);

        const shuffledDeck = extractDeckById(nextGameState, entityId);
        intactPart.forEach((card, index) => {
            assert.equal(card.entityId, shuffledDeck.cards[index].entityId);
        })
    })
})