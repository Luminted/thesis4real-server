import { original } from "immer";
import { uuid } from "short-uuid";
import { Singleton, Inject } from "typescript-ioc";
import { ICardEntity, EEntityTypes, IAddCardVerb, IFlipVerb, IGrabFromHandVerb, IPutInHandVerb, IReorderHandVerb } from "../../../typings";
import { GameStateStore } from "../../../stores";
import { extractCardFromClientHandById, extractClientById, extractCardById, extractClientHandById } from "../../../extractors";
import { zIndexLimit } from "../../../config";
import { calcNextZIndex, removeAndUpdateOrderings } from "../../../utils";

@Singleton
export class CardVerbHandler {
  @Inject
  private gameStateStore: GameStateStore;

  grabFromHand(verb: IGrabFromHandVerb) {
    this.gameStateStore.changeState((draft) => {
      const gameState = original(draft);
      const { clientId, entityId, positionX, positionY, grabbedAtX, grabbedAtY, faceUp, grabbedFrom } = verb;
      const clientHand = extractClientHandById(draft, grabbedFrom);
      const grabbedCard = extractCardFromClientHandById(gameState, grabbedFrom, entityId);
      const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
      const { ownerDeck, metadata } = grabbedCard;
      const { cards: cardsInHand, ordering } = clientHand;

      // create entity from hand card
      const grabbedCardEntity = this.createCardEntity(positionX, positionY, faceUp, entityId, ownerDeck, nextTopZIndex, 0, clientId, metadata);

      // add to card entities
      draft.cards.set(grabbedCardEntity.entityId, grabbedCardEntity);

      // set grabbed info
      extractClientById(draft, clientId).grabbedEntity = {
        entityId,
        grabbedAtX,
        grabbedAtY,
        entityType: EEntityTypes.CARD,
      };

      // remove card from hand & update ordering
      const indexOfGrabbedCard = cardsInHand.map((card) => card.entityId).indexOf(entityId);
      const updatedOrdering = removeAndUpdateOrderings(ordering, [indexOfGrabbedCard]);
      clientHand.ordering = updatedOrdering;
      clientHand.cards = cardsInHand.filter((_, index) => index !== indexOfGrabbedCard);
    });
  }

  putInHand(verb: IPutInHandVerb) {
    this.gameStateStore.changeState((draft) => {
      const { clientId, entityId, faceUp, toHandOf } = verb;
      const { metadata, ownerDeck } = extractCardById(draft, entityId);
      const handCard = this.createHandCard(entityId, faceUp, ownerDeck, metadata);
      const client = extractClientById(draft, clientId);
      const clientHand = extractClientHandById(draft, toHandOf);

      clientHand.cards.push(handCard);
      clientHand.ordering.push(clientHand.ordering.length);
      client.grabbedEntity = null;
      draft.cards.delete(entityId);
    });
  }

  flip(verb: IFlipVerb) {
    const { entityId } = verb;
    const entity = extractCardById(this.gameStateStore.state, entityId);

    this.gameStateStore.changeState((draft) => {
      extractCardById(draft, entityId).faceUp = !entity.faceUp;
    });
  }

  addCard(verb: IAddCardVerb) {
    const { faceUp, positionX, positionY, rotation, metadata } = verb;

    this.gameStateStore.changeState((draft) => {
      const nextZIndex = calcNextZIndex(draft, zIndexLimit);
      const newCard = this.createCardEntity(positionX, positionY, faceUp, uuid(), null, nextZIndex, rotation, null, metadata);

      draft.cards.set(newCard.entityId, newCard);
    });
  }

  reorderHand(verb: IReorderHandVerb) {
    const { clientId, order } = verb;
    this.gameStateStore.changeState((draft) => {
      extractClientHandById(draft, clientId).ordering = order;
    });
  }

  createCardEntity(
    positionX: number,
    positionY: number,
    faceUp: boolean,
    entityId: string,
    ownerDeck: string,
    zIndex: number,
    rotation: number,
    grabbedBy: string,
    metadata: object,
  ): ICardEntity {
    return {
      positionX,
      positionY,
      ownerDeck,
      rotation,
      faceUp,
      entityId,
      zIndex,
      grabbedBy,
      metadata,
      entityType: EEntityTypes.CARD,
    };
  }

  createHandCard(entityId, faceUp, ownerDeck, metadata) {
    return {
      entityId,
      faceUp,
      ownerDeck,
      metadata,
    };
  }
}
