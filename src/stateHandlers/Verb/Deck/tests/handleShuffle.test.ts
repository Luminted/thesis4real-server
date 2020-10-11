import assert from "assert";
import { Container } from "typescript-ioc";
import { extractDeckById } from "../../../../extractors/gameStateExtractors";
import { deckEntityMock1 } from "../../../../mocks/entityMocks";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { DeckVerbTypes, IShuffleVerb } from "../../../../types/verb";
import { DeckVerbHandler } from "../DeckVerbHandler";

describe(`handling ${DeckVerbTypes.SHUFFLE}`, () => {

    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {entityId} = deckEntityMock1;
    const verb: IShuffleVerb = {
        entityId,
        type: DeckVerbTypes.SHUFFLE,
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(entityId, {...deckEntityMock1});
        })
    })

    it('should only shuffle the rest of the deck', () => {
        const drawIndex = 14;
        const intactPart = deckEntityMock1.cards.slice(0, 14);
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