import { Inject, Singleton } from "typescript-ioc";
import {shuffle} from "@pacote/shuffle";
import { extractDeckById } from "../../../extractors/gameStateExtractors";
import { createCardEntity } from "../../../factories";
import { GameStateStore } from "../../../stores/GameStateStore";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { DeckVerb } from "../../../types/verbTypes";
import { original } from "immer";
import { calcNextZIndex } from "../../../utils";
import { gameConfig } from "../../../config";

@Singleton
export class DeckVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

    drawCard(verb: DeckVerb, faceUp: boolean) {
        this.gameStateStore.changeState(draft => {
            const {zIndexLimit} = gameConfig;
            const {entityId} = verb;
            const deck = extractDeckById(draft, entityId);
            const drawnCard = deck.cards[deck.drawIndex];
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
            const spawnedCard = createCardEntity(deck.positionX, deck.positionY, deck.width, deck.height, faceUp, drawnCard.entityId, deck.entityId, nextTopZIndex, drawnCard.isBound, deck.rotation, null, drawnCard.metadata);
            
            deck.drawIndex++;
            draft.cards.set(spawnedCard.entityId, spawnedCard);
        })

        return this.gameStateStore.state;
    }

    reset(verb: DeckVerb) {
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
                hand.cards = draft.hands.get(clientId).cards.filter(card => card.ownerDeck !== entityId);
                })

            //removing grabbed cards
            draft.clients.forEach(client => {
                const {grabbedEntitiy} = client;
                if(grabbedEntitiy && grabbedEntitiy.entityId === entityId){
                    client.grabbedEntitiy = null;
                }
            })
        })
        
        return this.gameStateStore.state;
    }

    shuffle(verb: DeckVerb) {
        const {entityId} = verb;
        this.gameStateStore.changeState(draft => {
            const {cards, drawIndex} = extractDeckById(original(draft), entityId);
            const draftDeck = extractDeckById(draft, entityId);
            const shuffledCards = shuffle(cards.slice(drawIndex));
            draftDeck.cards = [...cards.slice(0, drawIndex), ...shuffledCards];
        })

        return this.gameStateStore.state;
    }
}