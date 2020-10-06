import { original } from "immer";
import { uuid } from "short-uuid";
import { Singleton, Inject } from "typescript-ioc";
import { AddCardVerb, CardVerb } from "../../../types/verbTypes";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { GameStateStore } from "../../../stores/GameStateStore";
import { extractCardFromClientHandById, extractClientById, extractCardById, extractClientHandById } from "../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../config";
import { calcNextZIndex } from "../../../utils";
import { createCardEntity, createHandCardFromEntity } from "../../../factories";

@Singleton
export class CardVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.gameStateStore;
    }
 
    grabFromHand(verb: CardVerb) {
        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const {clientId, entityId, entityType, positionX,positionY} = verb;
            const clientHand = extractClientHandById(draft, clientId);
            const {width, height, ownerDeck, faceUp, metadata} = extractCardFromClientHandById(gameState, clientId, entityId); 
            const {entityScale} = gameState;
            const {zIndexLimit} = gameConfig;
            const positionOffsetX = Math.round(width * entityScale / 2);
            const positionOffsetY = Math.round(height * entityScale / 2);
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);

            // create entity from hand card
            //TODO: isBound, rotation should be dynamic
            const grabbedCardEntity = createCardEntity(positionX - positionOffsetX, positionY - positionOffsetY, width, height, faceUp, entityId, ownerDeck, nextTopZIndex, true, 0, clientId, metadata);

            // add to card entities
            draft.cards.set(grabbedCardEntity.entityId, grabbedCardEntity);

            // set grabbed info
            extractClientById(draft, clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }

            // remove card from hand
            clientHand.cards = clientHand.cards.filter(card => card.entityId !== entityId);
        })

        return this.gameStateStore.state;
    }

    putInHand(verb: CardVerb) {
        this.gameStateStore.changeState(draft => {
            const {clientId, entityId} = verb;
            const handCard = createHandCardFromEntity(extractCardById(original(draft), entityId));
            const clientHand = extractClientHandById(draft, clientId);

            clientHand.cards.push(handCard);
            extractClientById(draft, clientId).grabbedEntitiy = null;
            draft.cards.delete(entityId);
        })

        return this.gameStateStore.state;
    }

    putOnTable(verb: CardVerb){
        const {zIndexLimit} = gameConfig;
        const {clientId, entityId, positionX, positionY} = verb;

        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const handCard = extractCardFromClientHandById(gameState, clientId, entityId);
            if(handCard){
                const { faceUp, ownerDeck, width, height, entityId, isBound, metadata} = handCard;
                const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);

                //creating entity
                //TODO: rotation should be dynamic
                let cardEntity = createCardEntity(positionX, positionY, width, height, faceUp, entityId, ownerDeck, nextTopZIndex, isBound, 0, null, metadata );
                draft.cards.set(cardEntity.entityId, cardEntity);
                
                //removing from hand
                let subjectClientHand = extractClientHandById(draft, clientId);
                if(subjectClientHand){
                    subjectClientHand.cards.filter(card => card.entityId !== entityId);
                }
        
                // removing grabbedEntity
                extractClientById(draft, clientId).grabbedEntitiy = null;
            }
        })
        return this.gameStateStore.state;
    }

    flip(verb: CardVerb) {
        const { entityId, clientId } = verb;
        const entity = extractCardById(this.gameStateStore.state, entityId);

        if(entity){
            this.gameStateStore.changeState(draft => {
                extractCardById(draft, entityId).faceUp = !entity.faceUp;
            })
        }else{
            this.gameStateStore.changeState(draft => {
                const cardRepresentation = extractCardFromClientHandById(original(draft), clientId, entityId);
                extractCardFromClientHandById(draft, clientId, entityId).faceUp = !cardRepresentation.faceUp;
            })
        }

        return this.gameStateStore.state;
    }

    addCard(verb: AddCardVerb) {
        const {faceUp, width, height, positionX, positionY, isBound, rotation, metadata} = verb;
        const {zIndexLimit} = gameConfig;

        this.gameStateStore.changeState(draft => {
            const nextZIndex = calcNextZIndex(draft, zIndexLimit);
            const newCard = createCardEntity(positionX, positionY, width, height, faceUp, uuid(), null, nextZIndex, isBound, rotation, null, metadata);

            draft.cards.set(newCard.entityId, newCard);
        })

        return this.gameStateStore.state;
    }
    

}