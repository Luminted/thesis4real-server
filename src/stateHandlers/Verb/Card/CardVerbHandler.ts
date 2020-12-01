import { original } from "immer";
import { uuid } from "short-uuid";
import { Singleton, Inject } from "typescript-ioc";
import { CardEntity, EntityTypes, IAddCardVerb, IFlipVerb, IGrabFromHandVerb, IPutInHandVerb, IPutOnTableVerb, IReorderHandVerb } from "../../../typings";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { GameStateStore } from "../../../stores/GameStateStore";
import { extractCardFromClientHandById, extractClientById, extractCardById, extractClientHandById } from "../../../extractors/gameStateExtractors";
import { zIndexLimit } from "../../../config";
import { calcNextZIndex, removeAndUpdateOrderings } from "../../../utils";

@Singleton
export class CardVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.gameStateStore;
    }
 
    grabFromHand(verb: IGrabFromHandVerb) {
        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const {clientId, entityId, positionX,positionY, grabbedAtX, grabbedAtY, faceUp, grabbedFrom} = verb;
            const clientHand = extractClientHandById(draft, grabbedFrom);
            const grabbedCard = extractCardFromClientHandById(gameState, grabbedFrom, entityId); 
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
            const {ownerDeck, metadata} = grabbedCard;
            const {cards: cardsInHand, ordering} = clientHand;

            // create entity from hand card
            const grabbedCardEntity = this.createCardEntity(positionX, positionY, faceUp, entityId, ownerDeck, nextTopZIndex, 0, clientId, metadata);

            // add to card entities
            draft.cards.set(grabbedCardEntity.entityId, grabbedCardEntity);

            // set grabbed info
            extractClientById(draft, clientId).grabbedEntity = {
                entityId,
                grabbedAtX,
                grabbedAtY,
                entityType: EntityTypes.CARD,
            }

            // remove card from hand & update ordering
            const indexOfGrabbedCard = cardsInHand.map(card => card.entityId).indexOf(entityId);
            const updatedOrdering = removeAndUpdateOrderings(ordering, [indexOfGrabbedCard]);
            clientHand.ordering = updatedOrdering;
            clientHand.cards = cardsInHand.filter((_, index) => index !== indexOfGrabbedCard);
        })
        
        return this.gameStateStore.state;
    }

    putInHand(verb: IPutInHandVerb) {
        this.gameStateStore.changeState(draft => {
            const {clientId, entityId, faceUp} = verb;
            const { metadata, ownerDeck} = extractCardById(original(draft), entityId);
            const handCard = this.createHandCard(entityId, faceUp, ownerDeck, metadata);
            const client = extractClientById(draft, clientId);
            const clientHand = extractClientHandById(draft, clientId);

            clientHand.cards.push(handCard);
            clientHand.ordering.push(clientHand.ordering.length);
            client.grabbedEntity = null;
            draft.cards.delete(entityId);
        })

        return this.gameStateStore.state;
    }

    //TODO: this is code for client leaving
    putOnTable(verb: IPutOnTableVerb){
        const {clientId, entityId, positionX, positionY, faceUp} = verb;

        this.gameStateStore.changeState(draft => {
            const gameState = original(draft);
            const handCard = extractCardFromClientHandById(gameState, clientId, entityId);
            if(handCard){
                const { ownerDeck, entityId, metadata} = handCard;
                const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);

                //creating entity
                let cardEntity = this.createCardEntity(positionX, positionY, faceUp, entityId, ownerDeck, nextTopZIndex, 0, null, metadata );
                draft.cards.set(cardEntity.entityId, cardEntity);
                
                //removing from hand
                let subjectClientHand = extractClientHandById(draft, clientId);
                if(subjectClientHand){
                    subjectClientHand.cards.filter(card => card.entityId !== entityId);
                }
                subjectClientHand.ordering.pop();
        
                // removing grabbedEntity
                extractClientById(draft, clientId).grabbedEntity = null;
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

        return this.gameStateStore.state;
    }

    addCard(verb: IAddCardVerb) {
        const {faceUp, positionX, positionY, rotation, metadata} = verb;

        this.gameStateStore.changeState(draft => {
            const nextZIndex = calcNextZIndex(draft, zIndexLimit);
            const newCard = this.createCardEntity(positionX, positionY, faceUp, uuid(), null, nextZIndex, rotation, null, metadata);

            draft.cards.set(newCard.entityId, newCard);
        })

        return this.gameStateStore.state;
    }

    reorderHand(verb: IReorderHandVerb) {
        const {clientId, order} = verb;
        this.gameStateStore.changeState(draft => {
            extractClientHandById(draft, clientId).ordering = order;
        })

        return this.gameStateStore.state;
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
        metadata: object): CardEntity 
       {
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
               entityType: EntityTypes.CARD,
           }
   }

   createHandCard(entityId, faceUp, ownerDeck, metadata) {
       return {
           entityId,
           faceUp,
           ownerDeck,
           metadata
       }
    }
}