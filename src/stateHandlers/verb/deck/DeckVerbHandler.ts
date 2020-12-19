import { Inject, Singleton } from "typescript-ioc";
import { shuffle } from "@pacote/shuffle";
import { original } from "immer";
import { uuid } from "short-uuid";
import { extractClientHandById, extractDeckById } from "../../../extractors";
import { GameStateStore } from "../../../stores";
import { IAddDeckVerb, IDrawFaceUpVerb, IResetVerb, IShuffleVerb, IDeckEntity, EEntityTypes, IDrawFaceDownVerb, EDeckVerbTypes } from "../../../typings";
import { calcNextZIndex, removeAndUpdateOrderings } from "../../../utils";
import { emptyDeckMessage, zIndexLimit } from "../../../config";
import { CardVerbHandler } from "../card";

@Singleton
export class DeckVerbHandler {
  @Inject
  private gameStateStore: GameStateStore;
  @Inject
  private cardVerbHandler: CardVerbHandler;

  drawCard(verb: IDrawFaceUpVerb | IDrawFaceDownVerb, drawFaceUp: boolean) {
    const gameState = this.gameStateStore.state;
    const { entityId: deckEntityId } = verb;
    const deck = extractDeckById(gameState, deckEntityId);
    const topCard = this.getTopCard(deck);
    const { positionX, positionY, rotation, drawIndex } = deck;
    const { entityId: topCardEntityId, metadata } = topCard;

    this.gameStateStore.changeState((draft) => {
      const draftDeck = extractDeckById(draft, deckEntityId);
      const nextZIndex = calcNextZIndex(draft, zIndexLimit);
      const drawnCardEntity = this.cardVerbHandler.createCardEntity(positionX, positionY, drawFaceUp, topCardEntityId, deckEntityId, nextZIndex, rotation, null, metadata);

      draftDeck.drawIndex = drawIndex + 1;
      draft.cards.set(topCardEntityId, drawnCardEntity);
    });

    return topCardEntityId;
  }

  reset(verb: IResetVerb) {
    this.gameStateStore.changeState((draft) => {
      const { entityId } = verb;
      const deck = extractDeckById(draft, entityId);

      // removing cards from table
      deck.drawIndex = 0;
      draft.cards.forEach((card) => {
        if (card.ownerDeck === entityId) {
          draft.cards.delete(card.entityId);
        }
      });

      // removing from hands
      draft.hands.forEach((hand) => {
        const { clientId } = hand;
        const { cards, ordering } = extractClientHandById(draft, clientId);
        const cardsBelongingToResetDeckIndexes = cards.reduce((acc, { ownerDeck }, index) => {
          if (ownerDeck === entityId) {
            return [...acc, index];
          }

          return acc;
        }, []);
        hand.cards = cards.filter(({ ownerDeck }) => ownerDeck !== entityId);
        hand.ordering = removeAndUpdateOrderings(ordering, cardsBelongingToResetDeckIndexes);
      });

      // removing grabbed cards
      draft.clients.forEach((client) => {
        const { grabbedEntity: grabbedEntity } = client;
        if (grabbedEntity && grabbedEntity.entityId === entityId) {
          client.grabbedEntity = null;
        }
      });
    });
  }

  shuffle(verb: IShuffleVerb) {
    const { entityId } = verb;
    this.gameStateStore.changeState((draft) => {
      const { cards, drawIndex } = extractDeckById(original(draft), entityId);
      const draftDeck = extractDeckById(draft, entityId);
      const shuffledCards = shuffle(cards.slice(drawIndex));
      draftDeck.cards = [...cards.slice(0, drawIndex), ...shuffledCards];
    });
  }

  addDeck(verb: IAddDeckVerb) {
    const { positionX, positionY, rotation, metadata, containedCardsMetadata } = verb;
    const newDeckEntityId = uuid();

    this.gameStateStore.changeState((draft) => {
      const nextZIndex = calcNextZIndex(draft, zIndexLimit);
      const newDeck = this.createDeckEntity(positionX, positionY, nextZIndex, newDeckEntityId, rotation, null, metadata, containedCardsMetadata);
      draft.decks.set(newDeck.entityId, newDeck);
    });

    return newDeckEntityId;
  }

  createDeckEntity(
    positionX: number,
    positionY: number,
    zIndex: number,
    entityId: string,
    rotation: number,
    grabbedBy: string,
    metadata: object,
    cardsMetadata: object[] = [],
  ): IDeckEntity {
    return {
      positionX,
      positionY,
      rotation,
      entityId,
      grabbedBy,
      zIndex,
      metadata,
      entityType: EEntityTypes.DECK,
      drawIndex: 0,
      numberOfCards: cardsMetadata.length,
      cards: cardsMetadata.map((cardMetadata) => ({
        metadata: cardMetadata,
        entityId: uuid(),
      })),
    };
  }

  private getTopCard(deck: IDeckEntity) {
    const { cards } = deck;
    const topCard = cards[deck.drawIndex];

    if (!topCard) {
      throw new Error(emptyDeckMessage);
    }

    return topCard;
  }
}
