import { Inject, Singleton } from "typescript-ioc";
import {shuffle} from "@pacote/shuffle";
import { original } from "immer";
import {uuid} from "short-uuid";
import { extractDeckById } from "../../../extractors/gameStateExtractors";
import { GameStateStore } from "../../../stores/GameStateStore";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { IAddDeckVerb, IDrawFaceUpVerb, IResetVerb, IShuffleVerb, IDeckEntity, EEntityTypes } from "../../../typings";
import { calcNextZIndex, removeAndUpdateOrderings } from "../../../utils";
import { zIndexLimit } from "../../../config";
import { CardVerbHandler } from "../Card";

@Singleton
export class DeckVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    @Inject
    private cardVerbHandler: CardVerbHandler;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

    drawCard(verb: IDrawFaceUpVerb, faceUp: boolean = true) {
        this.gameStateStore.changeState(draft => {
            const {entityId} = verb;
            const deck = extractDeckById(draft, entityId);
            const drawnCard = deck.cards[deck.drawIndex];
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
            const spawnedCard = this.cardVerbHandler.createCardEntity(deck.positionX, deck.positionY, faceUp, drawnCard.entityId, deck.entityId, nextTopZIndex, deck.rotation, null, drawnCard.metadata);
            
            deck.drawIndex++;
            draft.cards.set(spawnedCard.entityId, spawnedCard);
        })

        return this.gameStateStore.state;
    }

    reset(verb: IResetVerb) {
        this.gameStateStore.changeState(draft => {
            const {entityId } = verb;
            const deck = extractDeckById(draft, entityId);

            //removing cards from table
            deck.drawIndex = 0;
            draft.cards.forEach(card => {
                if(card.ownerDeck === entityId){
                    draft.cards.delete(card.entityId);
                }
            })

            //removing from hands
            draft.hands.forEach(hand => {
                const {clientId} = hand;
                const { cards, ordering} = draft.hands.get(clientId);
                const cardsBelongingToResetDeckIndexes = cards.reduce((acc, {ownerDeck}, index) => {
                    if(ownerDeck === entityId){
                        return [...acc, index];
                    }
                    else{
                        return acc;
                    }
                },[])
                console.log("~~~~~", cardsBelongingToResetDeckIndexes);
                hand.cards = cards.filter(({ownerDeck}) => ownerDeck !== entityId);
                hand.ordering = removeAndUpdateOrderings(ordering, cardsBelongingToResetDeckIndexes);
            })

            //removing grabbed cards
            draft.clients.forEach(client => {
                const {grabbedEntity: grabbedEntity} = client;
                if(grabbedEntity && grabbedEntity.entityId === entityId){
                    client.grabbedEntity = null;
                }
            })
        })
        
        return this.gameStateStore.state;
    }

    shuffle(verb: IShuffleVerb) {
        const {entityId} = verb;
        this.gameStateStore.changeState(draft => {
            const {cards, drawIndex} = extractDeckById(original(draft), entityId);
            const draftDeck = extractDeckById(draft, entityId);
            const shuffledCards = shuffle(cards.slice(drawIndex));
            draftDeck.cards = [...cards.slice(0, drawIndex), ...shuffledCards];
        })

        return this.gameStateStore.state;
    }

    addDeck(verb: IAddDeckVerb) {
        const {positionX, positionY, rotation, metadata, containedCardsMetadata} = verb;

        this.gameStateStore.changeState(draft => {
            const nextZIndex = calcNextZIndex(draft, zIndexLimit);
            const newDeck = this.createDeckEntity(positionX, positionY, nextZIndex, uuid(), rotation, null, metadata, containedCardsMetadata);

            draft.decks.set(newDeck.entityId, newDeck);
        })

        return this.gameStateStore.state;
    }

    createDeckEntity(positionX: number, positionY: number, zIndex: number, entityId: string, rotation: number, grabbedBy: string, metadata: object, cardsMetadata: object[] = []): IDeckEntity {
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
            cards: cardsMetadata.map(metadata => ({ metadata, entityId: uuid()}))
        }
    }
}