import { Inject, Singleton } from "typescript-ioc";
import { CardVerbTypes, DeckVerbTypes, SharedVerbTypes, Verb } from "../../types/verb";
import { CardVerbHandler } from "./Card/CardVerbHandler";
import { SharedVerbHandler } from "./Shared/SharedVerbHandler";
import { DeckVerbHandler } from "./Deck/DeckVerbHandler";

@Singleton
export class VerbHandler {

    @Inject
    private sharedVerbHandler: SharedVerbHandler
    @Inject
    private cardVerbHandler: CardVerbHandler;
    @Inject
    private deckVerbHandler: DeckVerbHandler
    

    handleVerb(verb: Verb){
        console.log("incoming verb:", verb)
        switch(verb.type){
            case SharedVerbTypes.GRAB:
                return this.sharedVerbHandler.grabFromTable(verb);
            case SharedVerbTypes.RELEASE:
                return this.sharedVerbHandler.release(verb);
            case SharedVerbTypes.MOVE:
                return this.sharedVerbHandler.move(verb);
            case SharedVerbTypes.REMOVE:
                return this.sharedVerbHandler.remove(verb);
            case SharedVerbTypes.MOVE_TO:
                return this.sharedVerbHandler.moveTo(verb);
            case SharedVerbTypes.ROTATE:
                return this.sharedVerbHandler.rotate(verb);

            case DeckVerbTypes.DRAW_FACE_UP:
                return this.deckVerbHandler.drawCard(verb, true);
            case DeckVerbTypes.RESET:
                return this.deckVerbHandler.reset(verb);
            case DeckVerbTypes.SHUFFLE:
                return this.deckVerbHandler.shuffle(verb);
            case DeckVerbTypes.ADD_DECK:
                return this.deckVerbHandler.addDeck(verb);
                
            case CardVerbTypes.PUT_IN_HAND:
                return this.cardVerbHandler.putInHand(verb);
            case CardVerbTypes.GRAB_FROM_HAND:
                return this.cardVerbHandler.grabFromHand(verb);
            case CardVerbTypes.PUT_ON_TABLE:
                return this.cardVerbHandler.putOnTable(verb);
            case CardVerbTypes.FLIP:
                return this.cardVerbHandler.flip(verb);

            default:
                return;
        }
    }

}