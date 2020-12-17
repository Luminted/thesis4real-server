import { Inject, Singleton } from "typescript-ioc";
import { zIndexLimit } from "../../../config";
import { extractClientById, extractEntityByTypeAndId, extractGrabbedEntityOfClientById } from "../../../extractors";
import { calcNextZIndex } from "../../../utils";
import { GameStateStore } from "../../../stores";
import { EEntityTypes, IGrabVerb, IMoveToVerb, IMoveVerb, IReleaseVerb, IRemoveVerb, IRotateVerb } from "../../../typings";

@Singleton
export class SharedVerbHandler {
  @Inject
  private gameStateStore: GameStateStore;

  grabFromTable(verb: IGrabVerb) {
    this.gameStateStore.changeState((draft) => {
      const { positionX, positionY, entityId, entityType, clientId } = verb;
      const entity = extractEntityByTypeAndId(draft, entityType, entityId);
      if (entity && entity.grabbedBy === null) {
        const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
        extractClientById(draft, verb.clientId).grabbedEntity = {
          entityId,
          entityType,
          grabbedAtX: positionX,
          grabbedAtY: positionY,
        };
        entity.grabbedBy = clientId;
        entity.zIndex = nextTopZIndex;
      }
    });
    
  }

  move(verb: IMoveVerb) {
    this.gameStateStore.changeState((draft) => {
      const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
      if (grabbedEntity) {
        const { entityId, entityType } = grabbedEntity;
        const { positionX, positionY } = verb;
        const movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
        if (movedEntity) {
          const offsetX = positionX - grabbedEntity.grabbedAtX;
          const offsetY = positionY - grabbedEntity.grabbedAtY;
          const newPositionX = movedEntity.positionX + offsetX;
          const newPositionY = movedEntity.positionY + offsetY;

          movedEntity.positionX = newPositionX;
          movedEntity.positionY = newPositionY;
          grabbedEntity.grabbedAtX = positionX;
          grabbedEntity.grabbedAtY = positionY;
        }
      }
    });
    
  }

  moveTo(verb: IMoveToVerb) {
    this.gameStateStore.changeState((draft) => {
      const { positionX, positionY } = verb;
      const entityToMove = extractEntityByTypeAndId(draft, verb.entityType, verb.entityId);
      entityToMove.positionX = positionX;
      entityToMove.positionY = positionY;
    });

    
  }

  release(verb: IReleaseVerb) {
    this.gameStateStore.changeState((draft) => {
      const { entityType, entityId, clientId } = verb;
      extractClientById(draft, clientId).grabbedEntity = null;
      extractEntityByTypeAndId(draft, entityType, entityId).grabbedBy = null;
    });

    
  }

  remove(verb: IRemoveVerb) {
    this.gameStateStore.changeState((draft) => {
      const { entityType, entityId } = verb;
      if (entityType === EEntityTypes.CARD) {
        draft.cards.delete(entityId);
      } else if (entityType === EEntityTypes.DECK) {
        draft.decks.delete(entityId);
      }

      // remove from clients who are grabbing it
      draft.clients.forEach((client) => {
        const { grabbedEntity } = client;
        if (grabbedEntity !== null) {
          if (grabbedEntity.entityId === entityId) {
            client.grabbedEntity = null;
          }
        }
      });
    });

    
  }

  rotate(verb: IRotateVerb) {
    this.gameStateStore.changeState((draft) => {
      const { entityId, entityType, angle } = verb;
      const entity = extractEntityByTypeAndId(draft, entityType, entityId);
      entity.rotation = (entity.rotation + angle) % 360;
    });

    
  }
}
