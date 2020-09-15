import { Inject, Singleton } from "typescript-ioc";
import { extractDeckById } from "../../../extractors/gameStateExtractors";
import { cardFactory } from "../../../factories";
import { GameStateStore } from "../../../stores/GameStateStore";
import { TableStateStore } from "../../../stores/TableStateStore/TableStateStore";
import { DeckVerb } from "../../../types/verbTypes";

@Singleton
export class DeckVerbHandler {

    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

    drawFaceUp(verb: DeckVerb) {
        this.gameStateStore.changeState(draft => {
            const {entityId} = verb;
            const deck = extractDeckById(draft, entityId);
            const {rotation, cards, positionX, positionY, drawIndex} = deck;
            const drawnCard = cards[drawIndex];
            const spawnedCard = cardFactory(positionX, positionY, drawnCard.cardType, drawnCard.face, true, drawnCard.entityId, deck.entityId, undefined, undefined, undefined, undefined, rotation);
            deck.drawIndex++;
            draft.cards.set(spawnedCard.entityId, spawnedCard);
        })

        return this.gameStateStore.state;
    }

    reset(verb: DeckVerb) {
        this.gameStateStore.changeState(draft => {
            const {entityId } = verb;
            const deck = extractDeckById(draft, entityId);

            // TODO: nested interation needs to be optimized
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
}