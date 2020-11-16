import { original } from "immer";
import { uuid } from "short-uuid";
import { Singleton, Inject } from "typescript-ioc";
import { IAddCardVerb, IFlipVerb, IGrabFromHandVerb, IPutInHandVerb, IPutOnTable } from "../../../types/verb";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { GameStateStore } from "../../../stores/GameStateStore";
import { extractCardFromClientHandById, extractClientById, extractCardById, extractClientHandById } from "../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../config";
import { calcNextZIndex } from "../../../utils";
import { createCardEntity, createHandCard } from "../../../factories";
import { EntityTypes } from "../../../types/dataModelDefinitions";

@Singleton
export class CardVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.gameStateStore;
    }
 
    grabFromHand(verb: IGrabFromHandVerb) {
        //TODO: grab from any hand
        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const {clientId, entityId, positionX,positionY, grabbedAtX, grabbedAtY} = verb;
            const clientHand = extractClientHandById(draft, clientId);
            const { ownerDeck, faceUp, metadata} = extractCardFromClientHandById(gameState, clientId, entityId); 
            const {zIndexLimit} = gameConfig;
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);

            // create entity from hand card
            const grabbedCardEntity = createCardEntity(positionX, positionY, faceUp, entityId, ownerDeck, nextTopZIndex, 0, clientId, metadata);

            // add to card entities
            draft.cards.set(grabbedCardEntity.entityId, grabbedCardEntity);

            // set grabbed info
            extractClientById(draft, clientId).grabbedEntitiy = {
                entityId,
                grabbedAtX,
                grabbedAtY,
                entityType: EntityTypes.CARD,
            }

            // remove card from hand
            clientHand.cards = clientHand.cards.filter(card => card.entityId !== entityId);
        })

        return this.gameStateStore.state;
    }

    putInHand(verb: IPutInHandVerb) {
        this.gameStateStore.changeState(draft => {
            const {clientId, entityId, faceUp, revealed} = verb;
            const { metadata, ownerDeck} = extractCardById(original(draft), entityId);
            const handCard = createHandCard(entityId, faceUp, ownerDeck, revealed, metadata);
            const clientHand = extractClientHandById(draft, clientId);

            clientHand.cards.push(handCard);
            extractClientById(draft, clientId).grabbedEntitiy = null;
            draft.cards.delete(entityId);
        })

        return this.gameStateStore.state;
    }

    putOnTable(verb: IPutOnTable){
        const {zIndexLimit} = gameConfig;
        const {clientId, entityId, positionX, positionY, faceUp} = verb;

        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const handCard = extractCardFromClientHandById(gameState, clientId, entityId);
            if(handCard){
                const { ownerDeck, entityId, metadata} = handCard;
                const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);

                //creating entity
                let cardEntity = createCardEntity(positionX, positionY, faceUp, entityId, ownerDeck, nextTopZIndex, 0, null, metadata );
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

    flip(verb: IFlipVerb) {
        const { entityId } = verb;
        const entity = extractCardById(this.gameStateStore.state, entityId);

        if(entity){
            this.gameStateStore.changeState(draft => {
                extractCardById(draft, entityId).faceUp = !entity.faceUp;
            })
        }
        //TODO: separate this to unique verb
        // else{
        //     this.gameStateStore.changeState(draft => {
        //         const cardRepresentation = extractCardFromClientHandById(original(draft), clientId, entityId);
        //         extractCardFromClientHandById(draft, clientId, entityId).faceUp = !cardRepresentation.faceUp;
        //     })
        // }

        return this.gameStateStore.state;
    }

    addCard(verb: IAddCardVerb) {
        const {faceUp, positionX, positionY, rotation, metadata} = verb;
        const {zIndexLimit} = gameConfig;

        this.gameStateStore.changeState(draft => {
            const nextZIndex = calcNextZIndex(draft, zIndexLimit);
            const newCard = createCardEntity(positionX, positionY, faceUp, uuid(), null, nextZIndex, rotation, null, metadata);

            draft.cards.set(newCard.entityId, newCard);
        })

        return this.gameStateStore.state;
    }
    

}