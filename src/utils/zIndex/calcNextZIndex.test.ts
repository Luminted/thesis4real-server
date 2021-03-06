import assert from "assert";
import cloneDeep from "lodash.clonedeep";
import { cardEntityMock1, deckEntityMock1 } from "../../mocks";
import { GameStateStore } from "../../store";
import { ICardEntity, IDeckEntity } from "../../typings";
import { calcNextZIndex } from "./calcNextZIndex";

describe("utility functions", () => {
  describe("calcNextZIndex", () => {
    const gameStateStore = new GameStateStore();

    beforeEach(() => {
      gameStateStore.resetState();
    });

    it("should return topZIndex + 1", () => {
      const topZIndex = 2;
      const zIndexLimit = 10;
      gameStateStore.changeState((draft) => {
        draft.topZIndex = topZIndex;
        const nextZIndex = calcNextZIndex(draft, zIndexLimit);
        assert.equal(nextZIndex, topZIndex + 1);
      });
    });
    it("should increment topZIndex by one", () => {
      const zIndexLimit = 10;
      const originalState = cloneDeep(gameStateStore.state);
      gameStateStore.changeState((draft) => {
        calcNextZIndex(draft, zIndexLimit);
        assert.equal(draft.topZIndex, originalState.topZIndex + 1);
      });
    });
    it("should set topZIndex to the number of entities and return with it if z-index limit is reached", () => {
      const numberOfEntities = 15;
      const zIndexLimit = 50;
      gameStateStore.changeState((draft) => {
        for (let i = 0; i < numberOfEntities; i += 1) {
          const cardId = `card-id${i}`;
          draft.cards.set(cardId, { ...cardEntityMock1, entityId: cardId });
        }
        draft.topZIndex = zIndexLimit;

        const nextZIndex = calcNextZIndex(draft, zIndexLimit);
        assert.equal(draft.topZIndex, numberOfEntities);
        assert.equal(nextZIndex, numberOfEntities);
      });
    });
    it("should reset z-indexes of all entities to start from 0 while keeping order if topZIndex reaches limit", () => {
      const zIndexLimit = 50;
      const numberOfCards = 6;
      const numberOfDecks = 4;
      const numberOfEntities = numberOfCards + numberOfDecks;
      gameStateStore.changeState((draft) => {
        for (let i = 0; i < numberOfCards; i += 1) {
          const cardId = `${numberOfEntities - i - 1}`;
          const card: ICardEntity = { ...cardEntityMock1, entityId: cardId, zIndex: zIndexLimit - i };
          draft.cards.set(card.entityId, card);
        }
        for (let i = 0; i < numberOfDecks; i += 1) {
          const deckId = `${numberOfEntities - numberOfCards - i - 1}`;
          const deck: IDeckEntity = { ...deckEntityMock1, entityId: deckId, zIndex: zIndexLimit - numberOfCards - i };
          draft.decks.set(deck.entityId, deck);
        }
        draft.topZIndex = zIndexLimit;
        calcNextZIndex(draft, zIndexLimit);
        for (let i = 0; i < numberOfDecks; i += 1) {
          assert.equal(draft.decks.get(`${i}`).zIndex, i);
        }
        for (let i = 0; i < numberOfCards; i += 1) {
          assert.equal(draft.cards.get(`${i + numberOfDecks}`).zIndex, i + numberOfDecks);
        }
      });
    });
  });
});
