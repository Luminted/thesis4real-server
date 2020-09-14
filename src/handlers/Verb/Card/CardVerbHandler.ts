import { Singleton, Inject } from "typescript-ioc";
import { CardVerb } from "../../../types/verbTypes";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { GameStateStore } from "../../../stores/GameStateStore";
import { extractCardFromClientHandById, extractClientById, extractCardById, extractDeckById, extractClientHandById } from "../../../extractors/gameStateExtractors";
import { cardConfigLookup, gameConfig } from "../../../config";
import { calcNextZIndex } from "../../../utils";
import { cardFactory, cardRepFactory } from "../../../factories";

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
            const {clientId,entityId, entityType, positionX,positionY} = verb;
            const cardRep = extractCardFromClientHandById(draft, clientId, entityId); 
            const {cardType, face, faceUp, ownerDeck} = cardRep
            const {baseWidth, baseHeight} = cardConfigLookup[cardType];
            const {entityScale} = draft;
            const {zIndexLimit} = gameConfig;
            const positionOffsetX = Math.round(baseWidth * entityScale / 2);
            const positionOffsetY = Math.round(baseHeight * entityScale / 2);
            
            // TODO: card from cardRep function
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
            const grabbedCardEntity = cardFactory(positionX - positionOffsetX, positionY - positionOffsetY, cardType, face, faceUp, entityId, ownerDeck, undefined, clientId, nextTopZIndex);
            draft.cards.set(grabbedCardEntity.entityId, grabbedCardEntity);
            extractClientById(draft, clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }
        })

        return this.gameStateStore.state;
    }

    putInHand(verb: CardVerb) {
        this.gameStateStore.changeState(draft => {
            const {clientId, entityId} = verb;
            const {face, cardType} = extractCardById(draft, entityId);
            const cardRepresentation = cardRepFactory(cardType, face, entityId);
            const clientHand = extractClientHandById(draft, clientId);

            clientHand.cards.push(cardRepresentation);
            extractClientById(draft, clientId).grabbedEntitiy = null;
            draft.cards.delete(entityId);
        })

        return this.gameStateStore.state;
    }

    putOnTable(verb: CardVerb){
        this.gameStateStore.changeState(draft => {
            const {clientId, entityId, positionX, positionY} = verb;
            const cardPutOnTable = extractCardFromClientHandById(draft, clientId, entityId);
            if(cardPutOnTable){
                const {face, faceUp, ownerDeck, cardType} = cardPutOnTable;
                const owner = draft.decks.get(ownerDeck);
                //abort if card is still in owner deck
                if(owner && owner.cards.find(card => card.entityId === entityId)){
                    return;
                }
        
                //creating entity
                let cardEntity = cardFactory(positionX, positionY, cardType, face, faceUp, entityId, ownerDeck);
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

}