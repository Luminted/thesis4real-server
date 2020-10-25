import { Inject, Singleton } from "typescript-ioc";
import { gameConfig } from "../../../config";
import { extractClientById, extractEntityByTypeAndId, extractGrabbedEntityOfClientById } from "../../../extractors/gameStateExtractors";
import { calcNextZIndex } from "../../../utils";
import { GameStateStore } from "../../../stores/GameStateStore";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { EntityTypes } from "../../../types/dataModelDefinitions";
import { IGrabVerb, IMoveToVerb, IMoveVerb, IReleaseVerb, IRemoveVerb, IRotateVerb, Verb } from "../../../types/verb";

@Singleton
export class SharedVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

    grabFromTable(verb: IGrabVerb) {
        this.gameStateStore.changeState(draft => {
            const {positionX, positionY, entityId, entityType, clientId} = verb;
            const {zIndexLimit} = gameConfig;
            const entity = extractEntityByTypeAndId(draft, entityType, entityId);
            if(entity && entity.grabbedBy === null){
                const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
                extractClientById(draft, verb.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: positionX,
                    grabbedAtY: positionY
                }
                entity.grabbedBy = clientId;
                entity.zIndex = nextTopZIndex;
            }
        })
        return this.gameStateStore.state;
    }

    move(verb: IMoveVerb) {
        this.gameStateStore.changeState(draft => {
            const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
            if(grabbedEntity){
                const {entityId, entityType} = grabbedEntity
                const {positionX, positionY} = verb;
                const movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
                if(movedEntity){
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
        })
        return this.gameStateStore.state;
    }

    moveTo(verb: IMoveToVerb) {
        this.gameStateStore.changeState(draft => {
            const {positionX, positionY} = verb;
            const entityToMove = extractEntityByTypeAndId(draft, verb.entityType, verb.entityId);
            entityToMove.positionX = positionX;
            entityToMove.positionY = positionY;
        })

        return this.gameStateStore.state;
    }

    release(verb: IReleaseVerb) {
        this.gameStateStore.changeState(draft => {
            const {entityType, entityId, clientId} = verb;
            extractClientById(draft, clientId).grabbedEntitiy = null;
            extractEntityByTypeAndId(draft, entityType, entityId).grabbedBy = null;
        })

        return this.gameStateStore.state;
    }

    remove(verb: IRemoveVerb) {
        this.gameStateStore.changeState(draft => {
            const {entityType, entityId} = verb;
            if(entityType === EntityTypes.CARD){
                draft.cards.delete(entityId);
            }
            else if(entityType === EntityTypes.DECK){
                draft.decks.delete(entityId);
            }
        })

        return this.gameStateStore.state;
    }

    rotate(verb: IRotateVerb){
        this.gameStateStore.changeState(draft => {
            const {entityId,entityType, angle} = verb;
            const entity = extractEntityByTypeAndId(draft, entityType, entityId);
            entity.rotation = entity.rotation + angle % 360;
        });

        return this.gameStateStore.state;
    }
}